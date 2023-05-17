import { Product, ProductModel } from "../models";
import { Inject, Service } from "typedi";
import { BaseService } from "./base.service";
import { GetListQuery, ListData } from "../lib";
import Boom from "@hapi/boom";
import {
  ImportXianExcelDto,
  XianProductCreateDto,
  XianProductEditDto,
  XianProductPublishDto,
  XianProductPublishManyDto,
} from "../dtos";
import { XianProductService } from "./xian.product.service";
import xlsx from "node-xlsx";
import trimAll from "../utils/trimAll";
import { InsertFromXianExcelRecord } from "../events/InsertFromXianExcelRecord";
import { PublishToXianEvent } from "../events";

@Service()
export class ProductService extends BaseService<Product> {
  @Inject(() => XianProductService)
  xianProductService: XianProductService;

  @Inject(() => InsertFromXianExcelRecord)
  insertFromXianExcelRecordEvent: InsertFromXianExcelRecord;

  @Inject(() => PublishToXianEvent)
  publishToXianEvent: PublishToXianEvent;

  public async getProductList(
    input: GetListQuery<Product>
  ): Promise<ListData<Product>> {
    const { data, total } = await this.getListData<Product>(
      ProductModel,
      input,
      ["title", "bookData.isbn", "category"]
    );
    return {
      data,
      total,
    };
  }

  public async createProduct(input: any): Promise<Product> {
    const product = await ProductModel.create(input);
    return product;
  }

  public async getProductById(id: string): Promise<Product> {
    return ProductModel.findOne({ id });
  }
  public async deleteProductById(id: string) {
    const product = await ProductModel.findOne({ id });
    if (!product) {
      throw Boom.notFound("商品不存在");
    }
    await ProductModel.deleteMany({ id });
    await this.xianProductService.deleteXianProduct(product.xianProductId);
    return product;
  }

  public async adjustPricesProduct(input: XianProductPublishManyDto) {
    console.log({ input });
    const xianProductIdList = [];
    for (let index = 0; index < input.productIds.length; index++) {
      const productId = input.productIds[index];
      const product = await ProductModel.findOne({ id: productId });
      if (!product) {
        throw Boom.notFound("商品不存在");
      }
      if (!product.xianProductId) {
        continue;
      }
      const price =
        (product.bookData?.newPrice || product.bookData?.price) * input.rate +
        input.addPrice;
      try {
        const updateRlt = await this.xianProductService.adjustProductPrice({
          xianProductId: product.xianProductId,
          price: +price.toFixed(0),
        });

        if (updateRlt.status === 200) {
          await this.xianProductService.getProductDetailAndCheckUpdate(
            updateRlt.data.product_id
          );
        }
        xianProductIdList.push(product.xianProductId);
      } catch (error) {
        console.error({ error });
        continue;
      }
    }
    return xianProductIdList;
  }

  public async importFromXianExcel(input: ImportXianExcelDto) {
    try {
      const { fileTypeFromBuffer } = require("file-type");
      const fileType = await fileTypeFromBuffer(input.file._data);
      if (fileType.ext !== "xlsx") {
        throw Boom.badRequest("文件格式错误");
      }
    } catch (error) {
      console.error({ error });
    }
    try {
      const workSheetsFromBuffer = xlsx.parse(input.file._data);

      for (
        let index = 0;
        index < workSheetsFromBuffer[0].data.length;
        index++
      ) {
        try {
          const record = workSheetsFromBuffer[0].data[index];
          const price = record[1];
          const xianProductId = record[2];
          console.log({ price, xianProductId });
          this.insertFromXianExcelRecordEvent.trigger({ xianProductId, price });
        } catch (error) {
          console.error({ error });
          continue;
        }
      }
      return workSheetsFromBuffer;
    } catch (error) {
      console.error({ error });
      throw Boom.badRequest("文件格式错误");
    }
  }

  public async putXianProduct(input: XianProductPublishDto) {
    const { productId, xianInfo } = input;
    const product = await ProductModel.findOne({ id: productId });
    if (!product) {
      throw Boom.notFound("商品不存在");
    }
    let rlt = null;
    if (product.xianProductId && product.xianProductId !== "") {
      rlt = await this.updateXianProduct(
        product.xianProductId,
        product,
        xianInfo
      );
    } else {
      rlt = await this.createXianProduct(product, xianInfo);
    }

    return rlt;
  }

  public async banProductOnXianByISBN(isbn: string) {
    const productToBanned = await ProductModel.findOneAndUpdate(
      {
        "bookData.isbn": isbn,
      },
      {
        bannedOnXian: true,
        updatedAt: new Date(),
      },
      {
        upsert: true,
      }
    );
    return productToBanned;
  }

  public putXianProducts(input: { productIds: string[] }) {
    return input.productIds.map((productId) => {
      this.publishToXianEvent.trigger({ productId });
      return productId;
    });
  }

  public async updateXianProduct(
    xianProductId: string,
    product: Product,
    xianInfo: {
      channel_cat_id: string;
      title: string;
      desc: string;
      images: string[];
      price: number;
    }
  ) {
    const updateXianProductInput = new XianProductEditDto();
    updateXianProductInput.product_id = xianProductId;
    updateXianProductInput.title =
      "【正版二手】" +
      product.title +
      "作者" +
      ((product.bookData?.authors && product.bookData?.authors[0]) || "") +
      "出版社" +
      product.bookData?.publisher;
    updateXianProductInput.title = trimAll(updateXianProductInput.title).slice(
      0,
      30
    );
    updateXianProductInput.price = xianInfo.price || product.price;
    updateXianProductInput.stock = product.stock || 99;
    updateXianProductInput.channel_cat_id = xianInfo.channel_cat_id;
    updateXianProductInput.district_id = 510116;
    updateXianProductInput.outer_id = product.bookData?.isbn;
    updateXianProductInput.images = [
      ...xianInfo.images,
      "https://img2.sosotec.com/product/20230317/121901-3893ckjk.jpg",
    ];
    updateXianProductInput.desc =
      xianInfo.desc ||
      "✅经营十多年的实体商家，本店均为正版二手，盗版全额退款。二手书利润低不讲价，可以拍就有货，直接拍。\n\n✅八五新左右，笔记不可避免，择优发货，都紫外线酒精消毒过，放心使用！非偏远地方包邮\n\n✅快速发货，一般48小时内，多仓库发货，快递不指定！\n\n✅二手产品不接受无理由退货，个人原因引起的退货/改地址都另收6元/单！\n\n😘最后祝各位学子金榜题名，永不挂科。";
    const updateRlt = await this.xianProductService.editXianProduct(
      updateXianProductInput
    );
    if (updateRlt.status === 200) {
      product.xianProductId = updateRlt.data?.product_id;
      if (updateRlt.data?.product_id) {
        await this.xianProductService.getProductDetailAndCheckUpdate(
          updateRlt.data.product_id
        );
      }
    }
    return updateRlt;
  }

  public async createXianProduct(
    product: Product,
    xianInfo: {
      channel_cat_id: string;
      title: string;
      desc: string;
      images: string[];
      price: number;
    }
  ) {
    const createXianProductInput = new XianProductCreateDto();
    createXianProductInput.title =
      "【正版二手】" +
      product.title +
      "作者" +
      (product.bookData?.authors[0] || "") +
      "出版社";
    product.bookData?.publisher;
    createXianProductInput.title = createXianProductInput.title.slice(0, 29);
    createXianProductInput.price =
      +xianInfo.price.toFixed(0) || +product.price.toFixed(0);
    createXianProductInput.stock = product.stock || 99;
    createXianProductInput.channel_cat_id = xianInfo.channel_cat_id;
    createXianProductInput.district_id = 510116;
    createXianProductInput.outer_id = product.bookData?.isbn;
    createXianProductInput.images = [
      ...product.images,
      "https://img2.sosotec.com/product/20230317/121901-3893ckjk.jpg",
    ];
    createXianProductInput.desc =
      xianInfo.desc ||
      "✅经营十多年的实体商家，本店均为正版二手，盗版全额退款。二手书利润低不讲价，可以拍就有货，直接拍。\n\n✅八五新左右，笔记不可避免，择优发货，都紫外线酒精消毒过，放心使用！非偏远地方包邮\n\n✅快速发货，一般48小时内，多仓库发货，快递不指定！\n\n✅二手产品不接受无理由退货，个人原因引起的退货/改地址都另收6元/单！\n\n😘最后祝各位学子金榜题名，永不挂科。";
    createXianProductInput.original_price = product.bookData?.bookPrice;
    createXianProductInput.support_fd10ms_policy = 0;
    createXianProductInput.support_fd24hs_policy = 0;
    createXianProductInput.support_sdr_policy = 1;
    createXianProductInput.support_nfr_policy = 1;
    createXianProductInput.book_data = {
      isbn: product.bookData?.isbn,
      title: product.bookData?.title,
      publisher: product.bookData?.publisher,
      author: product.bookData?.authors[0],
    };
    createXianProductInput.express_fee = 0;
    createXianProductInput.item_biz_type = 2;
    createXianProductInput.sp_biz_type = 24;

    const createRlt = await this.xianProductService.createNewProduct(
      createXianProductInput
    );
    if (createRlt.status === 200) {
      product.xianProductId = createRlt.data.product_id;
      await this.xianProductService.getProductDetailAndCheckUpdate(
        createRlt.data.product_id
      );
    }
    return createRlt;
  }

  async importFromXianFile(file: Buffer) {
    const { fileTypeFromBuffer } = require("file-type");
    const fileType = await fileTypeFromBuffer(file);
    console.log({ fileType });
  }
}
