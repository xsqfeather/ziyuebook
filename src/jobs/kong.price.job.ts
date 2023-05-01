import Agenda, { Job } from "agenda";
import { AgendaService } from "../lib";
import { getAgendaMongoURI } from "../lib/config";
import { PRODUCT_JOB } from "./namespaces";
import { Inject, Service } from "typedi";
import { LevelCacheService } from "../lib/services";
import { KongProductService } from "../services/kong.product.service";
import { Product, ProductModel } from "../models";
import { BrowserContextService } from "services/browser.context.service";

@Service()
export class KongPriceJob {
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

  @Inject(() => BrowserContextService)
  browserContextService: BrowserContextService;
  start = async () => {
    const product = await ProductModel.findOne({
      originUrl: {
        $exists: true,
        $ne: "",
      },
    }).sort({
      lastCheckTime: 1,
      updatedAt: 1,
    });
    await ProductModel.updateOne(
      { id: product.id },
      { lastCheckTime: new Date() }
    );
    if (product) {
      console.log(
        "开始检查======",
        product.title,
        "是否有新价格",
        product.originUrl
      );

      await this.kongProductService.getProductFromDetail(product.originUrl);
    }
    await this.start();
  };
}
