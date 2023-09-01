import { chromium } from "playwright";
import { Service } from "typedi";

@Service()
export class NewsMakerService {
  getNews = async () => {
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
    await page.goto("https://www.msn.com/zh-tw/news");
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
        article.provider = provider;
        article.providerHref = providerHref;
        article.publishTime = publishTime;

        await newPage.waitForTimeout(10000);
        await newPage.close();
        console.log({ article });
      } catch (error) {
        console.error(error);
        await newPage.close();
        continue;
      }
    }
    await page.close();
    await browser.close();
  };
}
