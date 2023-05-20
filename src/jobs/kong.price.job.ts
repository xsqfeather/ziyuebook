import { PRODUCT_JOB } from "./namespaces";
import { Inject, Service } from "typedi";
import { LevelCacheService } from "../lib/services";
import { KongProductService } from "../services/kong.product.service";
import { ProductModel } from "../models";
import { BrowserContextService } from "../services/browser.context.service";
import { waitTimeout } from "../utils";

@Service()
export class KongPriceJob {
  eventName = "KongPriceJob";

  started = false;

  levelKey = PRODUCT_JOB + this.eventName + "categoryUrlIndex";

  @Inject(() => LevelCacheService)
  levelCacheService: LevelCacheService;

  @Inject(() => KongProductService)
  kongProductService: KongProductService;

  @Inject(() => BrowserContextService)
  browserContextService: BrowserContextService;
  start = async () => {
    const product = await ProductModel.findOneAndUpdate(
      {
        "xian.product_status": 22,
      },
      {
        $set: {
          lastCheckTime: new Date(),
        },
      }
    ).sort({
      lastCheckTime: 1,
      buyUrlOnKong: 1,
    });

    if (product) {
      console.log(
        "开始检查======",
        product.title,
        "是否有新价格",
        product.originUrl
      );
      try {
        await this.kongProductService.getProductDetailFromISBN(
          product.bookData.isbn
        );
      } catch (error: any) {
        console.error(error);
      }
    }
    await waitTimeout(550);
    await this.start();
  };
}
