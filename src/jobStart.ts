import "reflect-metadata";

import { startJobs } from "./lib/startJobs";
import { KongCreeperJob, KongPriceJob, ProductsGetFromXianJob } from "./jobs";

startJobs([KongCreeperJob, ProductsGetFromXianJob, KongPriceJob]);
