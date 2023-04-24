import Agenda, { Job } from "agenda";
import { AgendaService } from "lib";
import { Product, ProductModel } from "models";
import { Inject, Service } from "typedi";
import { PRODUCT_JOB } from "./namespaces";
import { XianProductService } from "services/xian.product.service";
import { getAgendaMongoURI } from "lib/config";

@Service()
export class ProductDetailFromXianJob implements AgendaService<Product> {
  eventName = "FromXianDetail";

  @Inject(() => XianProductService)
  xianProductService: XianProductService;

  agenda = new Agenda({
    db: { address: getAgendaMongoURI(), collection: "fromXianDetailJob" },
  });

  constructor() {
    this.agenda.define(PRODUCT_JOB + this.eventName, this.handle);
  }
  handle = async (job: Job<Product>, done?: () => void) => {
    try {
      const product = job.attrs.data;
      if (!product) {
        return await this.start();
      }
      await this.xianProductService.getProductDetail(product.xianProductId);
      await this.start();
      done();
    } catch (error) {
      console.error(error);
    }
  };
  start = async () => {
    await this.agenda.start();
    const product = await ProductModel.findOne({
      xianProductId: {
        $exists: true,
        $ne: "",
      },
      onXian: false,
    }).sort({
      updatedAt: 1,
    });
    this.agenda.schedule("in 5 seconds", PRODUCT_JOB + this.eventName, product);
  };
}
