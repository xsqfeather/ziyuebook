import "reflect-metadata";

import { startJobs } from "./lib/startJobs";
import { KongCreeperJob, KongPriceJob, ProductsGetFromXianJob } from "./jobs";

(async function () {
  await startJobs([KongCreeperJob, ProductsGetFromXianJob, KongPriceJob]);
})();
