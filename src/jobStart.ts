import "reflect-metadata";

import { startJobs } from "./lib/startJobs";
import { KongCreeperJob, KongPriceJob, ProductsGetFromXianJob } from "./jobs";
import Container from "typedi";
import { BrowserContextService } from "./services/browser.context.service";

(async function () {
  await Container.get(BrowserContextService).getBrowser();
  await startJobs([KongCreeperJob, KongPriceJob, ProductsGetFromXianJob]);
})();
