import "reflect-metadata";

import { startJobs } from "./lib/startJobs";
import { KongCreeperJob } from "./jobs/kong.creeper.job";

startJobs([KongCreeperJob]);
