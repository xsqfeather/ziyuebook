import Agenda, { Job } from "agenda";
import { AgendaService } from "../lib";
import { getAgendaMongoURI } from "../lib/config";
import { PRODUCT_JOB } from "./namespaces";
import { Inject, Service } from "typedi";
import { LevelCacheService } from "../lib/services";
import { KongProductService } from "../services/kong.product.service";
import { Product, ProductModel } from "../models";

@Service()
export class KongPriceJob implements AgendaService<Product> {
  eventName = "KongCreeperJob";

  levelKey = PRODUCT_JOB + this.eventName + "categoryUrlIndex";

  agenda = new Agenda({
    db: { address: getAgendaMongoURI(), collection: "getKongPriceJobs" },
  });

  @Inject(() => LevelCacheService)
  levelCacheService: LevelCacheService;

  @Inject(() => KongProductService)
  kongProductService: KongProductService;

  constructor() {
    this.agenda.define(this.eventName, this.handle);
  }
  handle = async (job: Job<Product>, done?: () => void) => {
    try {
      const product = job.attrs.data;
      console.log(
        "开始检查======",
        product.title,
        "是否有新价格",
        product.originUrl
      );
      await this.kongProductService.getProductFromDetail(product.originUrl);
      await this.start();
      done?.();
    } catch (error) {
      console.error(error);
    }
  };

  start = async () => {
    await this.agenda.start();
    const product = await ProductModel.findOne({}).sort({
      lastCheckTime: 1,
    });
    await this.agenda.schedule("in 60 seconds", this.eventName, product);
  };
}