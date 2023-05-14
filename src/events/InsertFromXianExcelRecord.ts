import { XianProductService } from "../services/xian.product.service";
import { Inject, Service } from "typedi";
import { ProductModel, BookPublisherModel } from "../models";
import { EventEmitter } from "node:events";

class MyEmitter extends EventEmitter {}
@Service()
export class InsertFromXianExcelRecord {
  private emitter = new MyEmitter();

  public productXianIdJobs: string[] = [];

  private timer: NodeJS.Timer | null = null;

  @Inject(() => XianProductService)
  xianService: XianProductService;

  constructor() {
    console.log("事件名字", InsertFromXianExcelRecord.name);
    this.emitter.on(InsertFromXianExcelRecord.name, this.handle);
  }

  public async addJob(xianProductId: string) {
    this.productXianIdJobs.push(xianProductId);
    if (!this.timer) {
      this.timer = setInterval(() => {
        this.doJob();
      }, 100);
    }
  }

  public async doJob() {
    const xianProductId = this.productXianIdJobs.shift();

    if (xianProductId) {
      console.log("当前任务数量", this.productXianIdJobs.length);
      try {
        const detail = await this.xianService.getProductDetail(xianProductId);
        let publisher = await BookPublisherModel.findOne({
          name: detail.book_data.publisher,
        });
        publisher =
          publisher ||
          (await BookPublisherModel.create({
            name: detail.book_data.publisher,
          }));
        console.log({
          publisher: publisher.name,
          xianProductId,
          isbn: detail.book_data.isbn,
        });
        const existProduct = await ProductModel.findOne({
          xianProductId,
          "bookData.isbn": detail.book_data.isbn,
        });
        await ProductModel.updateOne(
          {
            xianProductId,
            "bookData.isbn": detail.book_data.isbn,
          },
          {
            $set: {
              xian: detail,
              onXian: true,
              xianProductId: detail.product_id,
              title: detail.book_data.title,
              cover: detail.images[0],
              price: existProduct?.price || detail.price,
              stock: detail.stock,
              category: existProduct?.category || detail.category,
              lastCheckTime: new Date(),
              bookData: {
                isbn: detail.book_data.isbn,
                authors: [detail.book_data.author],
                publisher: detail.book_data.publisher,
                publisherId: publisher?.id,
                bookPrice: detail.book_data.original_price,
                newPrice: detail.price,
                sellPrice: 0,
                //当前快递费用
                sellShipPrice: 0,
                newSellPrice: detail.price,
                newShipPrice: 0,
                price: detail.price,
                shipPrice: 0,
                ...(existProduct?.bookData || {}),
              },
              type: "book",
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      clearInterval(this.timer!);
      this.timer = null;
      return;
    }
  }

  private handle = async ({
    price,
    xianProductId,
  }: {
    xianProductId: string;
    price: number;
  }) => {
    try {
      console.log({ xianProductId, price });
      // this.addJob(xianProductId);
    } catch (error) {
      error.message = `插入闲鱼商品失败，${error.message}`;
      console.log({ error });
    }
  };

  public async trigger({
    price,
    xianProductId,
  }: {
    price: number;
    xianProductId: string;
  }): Promise<any> {
    this.emitter.emit(InsertFromXianExcelRecord.name, { xianProductId, price });
  }
}
