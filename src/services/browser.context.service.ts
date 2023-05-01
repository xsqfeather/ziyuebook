import path from "path";
import { BrowserContext, chromium } from "playwright";
import { Service } from "typedi";

@Service()
export class BrowserContextService {
  context: BrowserContext = null;

  getBrowser = async () => {
    if (!this.context) {
      try {
        this.context = await chromium.launchPersistentContext(
          path.resolve("userData"),
          {
            headless: true,
            // proxy: {
            //   server: "http://geo.iproyal.com:12321",
            //   username: "simon123",
            //   password: "lyp82ndlf",
            // },
          }
        );
      } catch (error) {
        console.error("打开浏览器出错", error);
        this.context = null;
      }
    }

    return this.context;
  };
}
