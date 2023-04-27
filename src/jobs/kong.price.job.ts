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
  eventName = "KongPriceJob";

  started = false;

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
      if (product) {
        await this.kongProductService.getProductFromDetail(product.originUrl);
      }
      await this.start();
      done?.();
    } catch (error) {
      console.error(error);
      await this.agenda.stop();
      this.started = false;
      await this.start();

      done?.();
    }
  };

  start = async () => {
    if (!this.started) {
      await this.agenda.start();
      this.started = true;
    }
    const product = await ProductModel.findOne({
      originUrl: {
        $exists: true,
        $ne: "",
      },
    }).sort({
      lastCheckTime: 1,
      updatedAt: 1,
    });

    await this.agenda.schedule("in 2 minutes", this.eventName, product);
  };
}
