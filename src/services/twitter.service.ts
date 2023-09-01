import { Page, firefox } from "playwright";
import { Service } from "typedi";
import {
  TwitterPostTask,
  TwitterPostTaskModel,
} from "../models/twitter.post.task.model";

import urlencode from "urlencode";
import { waitTimeout } from "../lib";
import twitterPostTaskSeed from "../seeds/twitter.post.task.seed";

@Service()
export class TwitterService {
  async replyOne(page: Page, reply: string, seed: number, link: string) {
    await page.keyboard.press("Escape");

    const url = page.url();
    if (url === "about:blank" || url === "https://twitter.com/compose/tweet") {
      await page.goto(link);
    }
    await page.waitForLoadState();
    await page.waitForTimeout(seed + 7123);
    await page.keyboard.press("j");
    await page.waitForLoadState();
    await page.keyboard.press("r");
    await page.waitForTimeout(seed + 7123);

    let rlt = await page.$('div[data-testid="twc-cc-mask"]');
    if (rlt && (await rlt?.isVisible())) {
      await page.keyboard.type(reply);
      await page.keyboard.press("Control+Enter");
      await page.waitForLoadState();
      console.log("回复成功", new Date().toLocaleString());
      await page.waitForTimeout(seed + 7000);
    }
    await page.keyboard.press("Escape");
    await page.waitForLoadState();
  }

  async replyTweets(page: Page, postTask: TwitterPostTask) {
    const seed = (1 + Math.random()) * 1000;
    //拼接queryWord, encodeURI
    const queryWord = postTask.queryWord;
    const link = `https://twitter.com/search?q=${urlencode(queryWord)}&f=live`;
    console.log(link);
    await page.goto(link);
    await page.waitForLoadState();
    await page.waitForTimeout(seed + 3000);
    try {
      await this.replyOne(page, postTask.post, seed, link);
    } catch (error) {
      console.error(error);
      await page.keyboard.press("Escape");
      await page.goto(
        "https://twitter.com/search?q=lang%3Azh-cn%20%E7%BA%A6&src=typed_query&f=live "
      );
    }
  }

  async postToTwitter(path: string) {
    let browser = await firefox.launchPersistentContext(path, {
      headless: process.env.NODE_ENV === "production" ? true : false,
      proxy:
        process.env.NODE_ENV === "production"
          ? {
              server: "socks5://127.0.0.1:9909",
            }
          : undefined,
    });
    try {
      let page = await browser.newPage();

      let input = await TwitterPostTaskModel.findOne({}, null, {
        sort: {
          posted: 1,
        },
      });
      if (!input) {
        await this.seedInitData();
        input = await TwitterPostTaskModel.findOne({}, null, {
          sort: {
            posted: 1,
          },
        });
      }
      console.log(input.posted + "次数了", new Date().toLocaleString());

      await page.goto("https://twitter.com/home");
      await page.waitForLoadState();
      const seed = (1 + Math.random()) * 1000;
      await page.waitForTimeout(seed + 3000);
      await page.keyboard.press("n");
      await page.waitForTimeout(seed + 3000);
      await page.keyboard.type(input.post);
      await page.waitForTimeout(seed + 3000);
      await page.keyboard.press("Control+Enter");
      await page.waitForLoadState();
      console.log("发帖成功", new Date().toLocaleString());
      await page.waitForTimeout(seed + 7000);
      await this.replyTweets(page, input);
      input.posted++;
      await input.save();
      await page.close();
      await browser.close();
      page = null;
      browser = null;
    } catch (error) {
      await browser.close();
      browser = null;
      throw error;
    }
  }
  async seedInitData() {
    for (let i = 0; i < twitterPostTaskSeed.length; i++) {
      const element = twitterPostTaskSeed[i];
      const input = new TwitterPostTaskModel(element);
      await input.save();
    }
  }

  async startAllTask() {
    for (let index = 0; index < Number.MAX_SAFE_INTEGER; index++) {
      for (let j = 1; j <= 13; j++) {
        if (j === 10) {
          continue;
        }
        //11, 12 are not used
        if (j === 11 || j === 12) {
          continue;
        }
        try {
          console.log("开始发帖子", index, j);
          await this.postToTwitter("./user_data" + j);
          console.log("结束一轮发帖", index, j);
          await waitTimeout(1000 * 60 * 6);
        } catch (error) {
          console.error(error);
          continue;
        }
      }
    }
  }
}
