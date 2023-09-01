import "reflect-metadata";

import { ElementHandle, Page, chromium } from "playwright"; // Or 'chromium' or 'webkit'.
import mongoose from "mongoose";
import { getMongoURI } from "./lib/config";

const washContent = async (newPage: Page) => {
  const contentElement = await newPage.waitForSelector(".views-article-body");
  const paragraphs = await contentElement.$$("p");
  const imagePosition = {} as any;
  let washContent = "";
  for (let index = 0; index < paragraphs.length; index++) {
    const paragraph = paragraphs[index];
    //check if where is a image next the paragraph
    const nextElement = (await paragraph?.evaluateHandle((node) => {
      return node.nextElementSibling;
    })) as ElementHandle;

    const siblingElement = nextElement.asElement();

    const imageContent = await siblingElement.innerHTML();
    if (imageContent.includes("msn-article-image")) {
      const imageElement = await siblingElement.$("img");
      const imageSrc = await imageElement?.getAttribute("src");
      const imageAlt = await imageElement?.getAttribute("alt");
      const imageTitle = await imageElement?.getAttribute("title");
      washContent += `<p><img  src="${imageSrc}" alt="${imageAlt}" title="${imageTitle}"/></p>`;
      imagePosition[index] = imageSrc;
      continue;
    } else {
      console.log("imageContent", imageContent);
      const paragraphContent = await paragraph.innerHTML();
      washContent += `<p>${paragraphContent}</p>`;
    }
  }
  console.log("imagePosition", imagePosition);
  console.log("washed", washContent);
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
    };

    if (!article.href?.includes("https://www.msn")) {
      continue;
    }
    const newPage = await browser.newPage();
    try {
      await newPage.goto(href);
      console.log({ href });
      const pageContentElement = await newPage.waitForSelector(
        ".articlePage_gridarea_article"
      );
      for (let index = 0; index < 10; index++) {
        await newPage.evaluate(() => {
          window.scrollBy(0, 500);
        });
        await newPage.waitForTimeout(1000);
      }

      const content = await pageContentElement.innerHTML();

      await washContent(newPage);

      article.content = content;

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
      article.provider = provider;
      article.providerHref = providerHref;
      article.publishTime = publishTime;
      article.providerLogo = providerLogo;

      //   let newArticle = await ArticleModel.findOne({ originUrl: article.href });
      //   if (!newArticle) {
      //     newArticle = new ArticleModel({
      //       ...article,
      //       provider: {
      //         name: article.provider,
      //         href: article.providerHref,
      //         logo: article.providerLogo,
      //       },
      //       originUrl: article.href,
      //     });
      //     await newArticle.save();
      //   } else {
      //     console.log(
      //       "======================article already exist======================"
      //     );
      //   }
      //   console.log({ newArticle });

      console.log({ article });

      //   await newPage.waitForTimeout(1000);
      await newPage.waitForTimeout(1000 * 60 * 60);
      await newPage.close();
    } catch (error) {
      console.error(error);
      await newPage.close();
      continue;
    }
  }
  await page.close();
  await browser.close();
};

getNews();
