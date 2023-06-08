import { Inject, Service } from "typedi";
import { ProductModel } from "../models";
import { EventEmitter } from "node:events";
import { ProductService } from "../services";

class MyEmitter extends EventEmitter {}
@Service()
export class PublishToXianEvent {
  private emitter = new MyEmitter();

  public productIdJobs: string[] = [];

  private timer: NodeJS.Timer | null = null;

  @Inject(() => ProductService)
  productService!: ProductService;

  constructor() {
    console.log("事件名字", PublishToXianEvent.name);
    this.emitter.on(PublishToXianEvent.name, this.handle);
  }

  public async addJob(xianProductId: string) {
    this.productIdJobs.push(xianProductId);
    if (!this.timer) {
      this.timer = setInterval(() => {
        this.doJob();
      }, 100);
    }
  }

  public async doJob() {
    const productId = this.productIdJobs.shift();

    if (productId) {
      try {
        const product = await ProductModel.findOne({ id: productId });

        const xianInfo = {
          channel_cat_id: "ab78823bfd3c7134b108d382c4e6ea42",
          title: product?.title,
          desc: product?.bookData.contentIntro,
          images: product?.images,
          price: product?.price,
        };
        await this.productService.putXianProduct({
          productId,
          xianInfo,
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      clearInterval(this.timer!);
      this.timer = null;
      return;
    }
  }

  private handle = async ({ productId }: { productId: string }) => {
    try {
      // console.log({ xianProductId, price });
      await this.addJob(productId);
    } catch (error: any) {
      error.message = `插入闲鱼商品失败，${error.message}`;
      console.log({ error });
    }
  };

  public async trigger({ productId }: { productId: string }): Promise<any> {
    this.emitter.emit(PublishToXianEvent.name, { productId });
  }
}
