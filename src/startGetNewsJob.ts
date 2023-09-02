import "reflect-metadata";

import { ElementHandle, Page, chromium } from "playwright"; // Or 'chromium' or 'webkit'.
import mongoose from "mongoose";
import { getMongoURI } from "./lib/config";

import html2md from "html-to-md";
import Container from "typedi";
import { OpenAIService } from "./lib/services/openai.service";
import { ChatCompletionRequestMessage } from "openai";
import { ArticleModel } from "./models";

const washContent = async (newPage: Page) => {
  const contentElement = await newPage.waitForSelector(".views-article-body");
  const paragraphs = await contentElement.$$("p");
  const imagePosition = {} as any;
  let content = "";
  for (let index = 0; index < paragraphs.length; index++) {
    const paragraph = paragraphs[index];
    //check if where is a image next the paragraph
    const nextElement = (await paragraph?.evaluateHandle((node) => {
      return node.nextElementSibling;
    })) as ElementHandle;

    const siblingElement = nextElement.asElement();

    const imageContent = await siblingElement?.innerHTML();
    if (imageContent?.includes("msn-article-image")) {
      const imageElement = await siblingElement.$("img");
      const imageSrc = await imageElement?.getAttribute("src");
      const imageAlt = await imageElement?.getAttribute("alt");
      const imageTitle = await imageElement?.getAttribute("title");
      imagePosition[index] = { imageSrc, imageAlt, imageTitle };
      continue;
    } else {
      //   console.log("imageContent", imageContent);
      const paragraphContent = await paragraph.innerHTML();
      content += `<p>${paragraphContent}</p>`;
    }
  }
  // console.log("imagePosition", imagePosition);
  //   console.log("washed", washContent);
  return { content, imagePosition };
};

const toMarkdown = async (content: string) => {
  const markdown = html2md(content);
  //   console.log("markdown", markdown);
  return markdown;
};

const AIRewrite = async (content: string) => {
  const input: ChatCompletionRequestMessage[] = [
    {
      role: "user",
      content: `${content}, 请以更个人博主的角度重新阐述，加上一点吐槽和表情, 但是尽量保持信息的完整吧`,
    },
  ];
  let messages = await Container.get(OpenAIService).getContent(input);
  const newRewrite = messages.choices[0].message.content;
  input.push({
    role: "assistant",
    content: newRewrite,
  });
  input.push({
    role: "user",
    content: "给出对这篇文章SEO友好的标签吧,用逗号分隔下吧",
  });
  messages = await Container.get(OpenAIService).getContent(input);
  const tags = messages.choices[0].message.content;
  input.push({
    role: "assistant",
    content: tags,
  });
  input.push({
    role: "user",
    content: "我想要转发这篇到twitter上, 写个推文吧",
  });
  messages = await Container.get(OpenAIService).getContent(input);
  const twitterPost = messages.choices[0].message.content;
  input.push({
    role: "assistant",
    content: twitterPost,
  });
  input.push({
    role: "user",
    content: "为这篇文章起个更吸引人的标题吧",
  });
  messages = await Container.get(OpenAIService).getContent(input);
  const title = messages.choices[0].message.content;
  return {
    content: newRewrite,
    tags,
    twitterPost,
    title,
  };
};

const getNews = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(getMongoURI());
  const browser = await chromium.launchPersistentContext(
    "user_data_bing_news",
    {
      headless: process.env.NODE_ENV === "production" ? true : false,
      proxy:
        process.env.NODE_ENV === "production"
          ? {
              //   server: "socks5://127.0.0.1:9909",
              server: "socks5://127.0.0.1:7890",
            }
          : undefined,
    }
  );
  const page = await browser.newPage();
  await page.goto("https://www.msn.com/zh-cn/feed");
  await page.waitForSelector(".heading");
  //scroll to bottom  1000px per 10times
  for (let index = 0; index < 10; index++) {
    await page.evaluate(() => {
      window.scrollBy(0, 1000);
    });
    await page.waitForTimeout(1000);
  }

  const newElements = await page.$$(".card-container > cs-card");
  for (let index = 0; index < newElements.length; index++) {
    const element = newElements[index];
    const contentElement = await element.waitForSelector("cs-content-card");
    const title = await contentElement?.getAttribute("title");
    const href = await contentElement?.getAttribute("href");
    const imgElement = await element?.$("img");
    const imgSrc = await imgElement?.getAttribute("src");
    const article = {
      title,
      href,
      cover: imgSrc,
      content: "",
      provider: "",
      providerHref: "",
      providerLogo: "",
      publishTime: "",
      tags: [] as string[],
      twitterPost: "",
    };

    if (!article.href?.includes("https://www.msn")) {
      continue;
    }
    const newPage = await browser.newPage();
    await newPage.goto(href);
    await newPage.waitForSelector(".articlePage_gridarea_article");
    for (let index = 0; index < 10; index++) {
      await newPage.evaluate(() => {
        window.scrollBy(0, 500);
      });
      await newPage.waitForTimeout(1000);
    }

    let { content, imagePosition } = await washContent(newPage);
    const markdown = await toMarkdown(content);
    try {
      const {
        content: aiContent,
        title: newTitle,
        twitterPost,
        tags,
      } = await AIRewrite(markdown);
      const contentParagraphs = aiContent.split("\n");
      console.log("rewrite success", imagePosition);
      //insert images to markdown paragraphs
      for (const key in imagePosition) {
        if (Object.prototype.hasOwnProperty.call(imagePosition, key)) {
          const image = imagePosition[key];
          const imageMarkdown = `![${image.imageAlt}](${image.imageSrc})`;
          contentParagraphs.splice(parseInt(key), 0, imageMarkdown);
        }
      }
      //merge
      content = contentParagraphs.join("\n");
      article.content = content;
      article.tags = tags.split(",");
      article.title = newTitle;
      article.twitterPost = twitterPost;
    } catch (error) {
      console.log("error", error);
      await newPage.close();
      continue;
    }

    //get provider
    const providerElement = await newPage.waitForSelector(
      "msnews-views-title .providerContainer"
    );

    const provider = await providerElement?.innerText();
    const providerHref = await providerElement?.getAttribute("href");

    //get publishTime
    const publishTimeElement = await newPage.waitForSelector(
      "msnews-views-title .viewsInfo .content .tooltip"
    );
    const publishTime = await publishTimeElement?.getAttribute("data-content");

    //get providerLogo
    const providerLogoElement = await newPage.waitForSelector(
      "msnews-views-title .providerContainer .providerLogo img"
    );
    const providerLogo = await providerLogoElement?.getAttribute("src");
    article.provider = provider;
    article.providerHref = providerHref;
    article.publishTime = publishTime;
    article.providerLogo = providerLogo;

    let newArticle = await ArticleModel.findOne({ originUrl: article.href });
    if (!newArticle) {
      newArticle = new ArticleModel({
        ...article,
        provider: {
          name: article.provider,
          href: article.providerHref,
          logo: article.providerLogo,
        },
        originUrl: article.href,
      });
      await newArticle.save();
    } else {
      console.log(
        "======================article already exist======================"
      );
    }
    console.log({ newArticle });

    await newPage.waitForTimeout(1000);
    //   await newPage.waitForTimeout(1000 * 60 * 60);
    await newPage.close();
  }
  await page.close();
  await browser.close();
};

getNews();
