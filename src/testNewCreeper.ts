import { chromium } from "playwright"; // Or 'chromium' or 'webkit'.

(async () => {
  const browser = await chromium.launchPersistentContext(
    "/Users/simonxu/Library/Application Support/Google/Chrome/Default",
    {
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: false,
    }
  );
  const page = await browser.newPage();
  await page.goto("https://twitter.com");
  await page.waitForLoadState();

  const ral = await page.$("div");
  await ral?.click();
  await page.waitForLoadState();

  await page.keyboard.type("n");
  await page.waitForLoadState();
  await page.keyboard.type("还想试试，试试我的自动发推文功能啊!哈哈哈");
  await page.waitForLoadState();
  await page.keyboard.press("Meta+Enter");

  //   await page.getByText("发推").click();
  // await page.close();
})();
