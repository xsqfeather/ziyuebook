import "reflect-metadata";

import { ElementHandle, Page, firefox } from "playwright"; // Or 'chromium' or 'webkit'.
import mongoose from "mongoose";
import { getMongoURI } from "./lib/config";

import html2md from "html-to-md";

import { ArticleModel } from "./models";
import { waitTimeout } from "./lib";

const formatContent = async (newPage: Page) => {
  const contentElement = await newPage.waitForSelector("article");
  const imagePosition = {} as any;

  if ((await contentElement.innerHTML()).includes("msn-article-image")) {
    const firstImage = await contentElement.waitForSelector(
      "msn-article-image img",
      {
        timeout: 30000 * 4,
      }
    );

    const firstImageSrc = await firstImage?.getAttribute("src");
    const firstImageAlt = await firstImage?.getAttribute("alt");
    const firstImageTitle = await firstImage?.getAttribute("title");
    imagePosition[0] = {
      imageSrc: firstImageSrc,
      firstImageAlt,
      firstImageTitle,
    };
  }

  const paragraphs = await contentElement.$$("p");
  let formattedContent = "";
  for (let index = 0; index < paragraphs.length; index++) {
    const paragraph = paragraphs[index];
    //check if where is a image next the paragraph
    const nextElement = (await paragraph?.evaluateHandle((node) => {
      return node.nextElementSibling;
    })) as ElementHandle;

    const siblingElement = nextElement.asElement();

    const imageContent = await siblingElement?.innerHTML();

    if (imageContent?.includes("msn-article-image")) {
      console.log("imageContent", imageContent);
      const imageElement = await siblingElement.waitForSelector("img", {
        timeout: 30000 * 4,
      });
      const imageSrc = await imageElement?.getAttribute("src");
      const imageAlt = await imageElement?.getAttribute("alt");
      const imageTitle = await imageElement?.getAttribute("title");
      imagePosition[index + 1] = { imageSrc, imageAlt, imageTitle };
      continue;
    } else {
      //   console.log("imageContent", imageContent);
      const paragraphContent = await paragraph.innerHTML();
      formattedContent += `<p>${paragraphContent}</p>`;
    }
  }
  console.log("imagePosition", imagePosition);
  //   console.log("washed", washContent);
  return { formattedContent, imagePosition };
};

const toMarkdown = async (content: string) => {
  const markdown = html2md(content);
  //   console.log("markdown", markdown);
  return markdown;
};

const getNews = async (
  url: string,
  locale: "zh" | "en" | "zhTW",
  proxy: boolean
) => {
  const browser = await firefox.launchPersistentContext("user_data_bing_news", {
    headless: process.env.NODE_ENV === "production" ? true : false,
    proxy:
      process.env.NODE_ENV === "production" && proxy
        ? {
            // server: "socks5://127.0.0.1:9909",
            server: "socks5://127.0.0.1:7890",
          }
        : undefined,
  });
  const page = await browser.newPage();
  console.log("start get news");
  await page.goto(url);
  await page.waitForLoadState();

  await page.waitForSelector(".heading");
  //   await page.waitForTimeout(1000);
  for (let index = 0; index < 5; index++) {
    await page.evaluate(() => {
      window.scrollBy(0, 800);
    });
    await page.waitForLoadState();
    await page.waitForTimeout(2000);
  }

  const newElements = await page.$$(".card-container > cs-card");
  let newPage = await browser.newPage();
  let length = 3;

  for (let index = 0; index < length; index++) {
    console.log("index", index);
    if (index > 20) {
      break;
    }
    try {
      const element = newElements[index];
      if (!element) {
        continue;
      }
      await page.waitForTimeout(4000);
      const contentElement = await element?.waitForSelector("cs-content-card");
      const title = await contentElement?.getAttribute("title");
      const href = await contentElement?.getAttribute("href");
      const imgElement = await element?.waitForSelector("img[slot='media']", {
        timeout: 30000 * 4,
      });
      const imgSrc = await imgElement?.getAttribute("src");

      let article = await ArticleModel.findOne({ originUrl: href });
      if (article) {
        console.log("article already exist");
        length++;
        continue;
      } else {
        article = new ArticleModel();
      }
      if (!href?.includes("https://www.msn")) {
        continue;
      }
      article.cover = imgSrc;
      article.title = title;

      console.log("href", href);
      await newPage.goto(href);
      await newPage.waitForLoadState();
      for (let index = 0; index < 10; index++) {
        await newPage.evaluate(() => {
          window.scrollBy(0, 500);
        });
        await newPage.waitForTimeout(1000);
      }

      let { formattedContent, imagePosition } = await formatContent(newPage);
      const markdown = await toMarkdown(formattedContent);

      article.content = markdown;
      article.imagePosition = imagePosition;

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
      const publishTime = await publishTimeElement?.getAttribute(
        "data-content"
      );

      //get providerLogo
      const providerLogoElement = await newPage.waitForSelector(
        "msnews-views-title .providerContainer .providerLogo img"
      );
      const providerLogo = await providerLogoElement?.getAttribute("src");
      article.provider = {
        name: provider,
        href: providerHref,
        logo: providerLogo,
      };
      article.publishTime = new Date();
      article.originUrl = href;
      article.locale = locale;

      await article.save();
      console.log("newArticle=================", article);

      await newPage.waitForTimeout(1000);
      //   await newPage.waitForTimeout(1000 * 60 * 60);
    } catch (error) {
      console.log("error", error);
      await newPage.close();
      newPage = await browser.newPage();
      length++;
      continue;
    }
  }
  await page.close();
  await browser.close();
  await newPage.close();
};

const startJob = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(getMongoURI());
  for (let index = 0; index < Number.MAX_SAFE_INTEGER; index++) {
    await getNews("https://www.msn.cn/zh-cn/feed", "zh", false);
    await getNews("https://www.msn.com/zh-tw/feed", "zhTW", true);
    await getNews("https://www.msn.com/en-us/feed", "en", true);
    await getNews("https://www.msn.com/en-gb/feed", "en", true);
    await getNews("https://www.msn.com/zh-hk/feed", "zhTW", true);
    await getNews("https://www.msn.com/en-in/feed", "zhTW", true);
    https: await waitTimeout(1000 * 60 * 30);
  }
};

startJob();
