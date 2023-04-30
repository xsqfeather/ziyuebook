const KongCategoryUrls = [
  "https://item.kongfz.com/Ckexue/",
  "https://item.kongfz.com/Cyiyao/",
  "https://item.kongfz.com/Cjiaocai/",
  "https://item.kongfz.com/Cguoxue/",
  "https://item.kongfz.com/Cscyjs/",
  "https://item.kongfz.com/Cxiaoshuo/",
  "https://item.kongfz.com/Cwenxue/",
  "https://item.kongfz.com/Cyuyan/",
  "https://item.kongfz.com/Clishi/",
  "https://item.kongfz.com/Cdili/",
  "https://item.kongfz.com/Cyishu/",
  "https://item.kongfz.com/Czhengzhi/",
  "https://item.kongfz.com/Cfalv/",
  "https://item.kongfz.com/Cjunshi/",
  "https://item.kongfz.com/Czhexue/",
  "https://item.kongfz.com/Czongjiao/",
  "https://item.kongfz.com/Cjingji/",
  "https://item.kongfz.com/Cshwh/",
  "https://item.kongfz.com/Czonghe/",
  "https://item.kongfz.com/Cshaoer/",
  "https://item.kongfz.com/Cshenghuo/",
  "https://item.kongfz.com/Ctiyu/",
  "https://item.kongfz.com/Cjishu/",
  "https://item.kongfz.com/Cjisuanji/",
];
import Agenda, { Job } from "agenda";
import { AgendaService } from "../lib";
import { getAgendaMongoURI } from "../lib/config";
import { PRODUCT_JOB } from "./namespaces";
import { Inject, Service } from "typedi";
import { LevelCacheService } from "../lib/services";
import { KongProductService } from "../services/kong.product.service";

@Service()
export class KongCreeperJob implements AgendaService<{ categoryUrl: string }> {
  eventName = "KongCreeperJob";
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
  handle = async (job: Job<{ categoryUrl: string }>, done?: () => void) => {
    try {
      const { categoryUrl } = job.attrs.data;
      console.log({ categoryUrl });
      await this.kongProductService.toCategoryPage(categoryUrl);
      done?.();
    } catch (error) {
      console.error(error);
      await this.agenda.stop();
      this.started = false;
      done?.();
    }
    await this.start();
    done?.();
  };

  start = async () => {
    const currentIndex = await this.levelCacheService.get(this.levelKey);
    console.log({ currentIndex });
    const categoryUrl = KongCategoryUrls[Number(currentIndex || "0")];
    await this.levelCacheService.put(
      this.levelKey,
      categoryUrl ? Number(currentIndex || "0") + 1 : 0
    );
    if (!this.started) {
      await this.agenda.start();
      this.started = true;
      await this.agenda.now(this.eventName, {
        categoryUrl: categoryUrl || KongCategoryUrls[0],
      });
    } else {
      await this.agenda.schedule("in 75 minutes", this.eventName, {
        categoryUrl: categoryUrl || KongCategoryUrls[0],
      });
    }
  };
}
