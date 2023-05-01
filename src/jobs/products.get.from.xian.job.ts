import { Inject, Service } from "typedi";
import Agenda, { Job } from "agenda";

import { PRODUCT_JOB } from "./namespaces";
import { AgendaService } from "../lib/types";
import { XianProductService } from "../services/xian.product.service";
import { LevelCacheService } from "../lib/services";
import { getAgendaMongoURI } from "../lib/config";

@Service()
export class ProductsGetFromXianJob
  implements AgendaService<{ currentPage: 1 }>
{
  @Inject(() => XianProductService)
  xianProductService: XianProductService;

  @Inject(() => LevelCacheService)
  levelCacheService: LevelCacheService;

  eventName = "FromXianList";
  agenda = new Agenda({
    db: { address: getAgendaMongoURI(), collection: "fromXianListJobs" },
  });
  started = false;
  constructor() {
    this.agenda.define(PRODUCT_JOB + this.eventName, this.handle);
  }
  handle = async (job: Job<{ currentPage: 1 }>, done: () => void) => {
    try {
      const { currentPage } = job.attrs.data;
      console.log("当前页面", currentPage);
      await this.xianProductService.getProducts(String(currentPage));
      await this.start();
      done();
    } catch (error) {
      console.error(error);
      await this.agenda.stop();
      this.started = false;
      await this.start();
      done();
    }
  };
  start = async () => {
    if (!this.started) {
      await this.agenda.start();
      this.started = true;
    }
    await this.agenda.start();
    const levelKey = PRODUCT_JOB + this.eventName + "currentPage";
    const currentPage = await this.levelCacheService.get(levelKey);
    await this.levelCacheService.put(levelKey, +currentPage + 1);
    this.agenda.schedule("in 30 seconds", PRODUCT_JOB + this.eventName, {
      currentPage: currentPage || 1,
    });
  };
}
