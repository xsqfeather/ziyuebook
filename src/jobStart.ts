import "reflect-metadata";

import { startJobs } from "./lib/startJobs";
import { KongCreeperJob } from "./jobs/kong.creeper.job";
import { ProductsGetFromXianJob } from "./jobs/products.get.from.xian.job";

startJobs([KongCreeperJob, ProductsGetFromXianJob]);
