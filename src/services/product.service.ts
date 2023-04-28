import { Product, ProductModel } from "../models";
import { Inject, Service } from "typedi";
import { BaseService } from "./base.service";
import { GetListQuery, ListData } from "../lib";
import Boom from "@hapi/boom";
import {
  XianProductCreateDto,
  XianProductEditDto,
  XianProductPublishDto,
} from "../dtos";
import { XianProductService } from "./xian.product.service";

@Service()
export class ProductService extends BaseService<Product> {
  @Inject(() => XianProductService)
  xianProductService: XianProductService;

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
      xianInfo.title || "【正版二手】" + product.title;
    updateXianProductInput.price = xianInfo.price || product.price;
    updateXianProductInput.stock = product.stock || 99;
    updateXianProductInput.channel_cat_id = xianInfo.channel_cat_id;
    updateXianProductInput.district_id = 510116;
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
      product.xianProductId = updateRlt.data.product_id;
      await this.xianProductService.getProductDetail(updateRlt.data.product_id);
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
      xianInfo.title || "【正版二手】" + product.title;
    createXianProductInput.price =
      +xianInfo.price.toFixed(0) || +product.price.toFixed(0);
    createXianProductInput.stock = product.stock || 99;
    createXianProductInput.channel_cat_id = xianInfo.channel_cat_id;
    createXianProductInput.district_id = 510116;
    createXianProductInput.images = [
      ...xianInfo.images,
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
    createXianProductInput.outer_id = "9787802013919";

    const createRlt = await this.xianProductService.createNewProduct(
      createXianProductInput
    );
    if (createRlt.status === 200) {
      product.xianProductId = createRlt.data.product_id;
      await this.xianProductService.getProductDetail(createRlt.data.product_id);
    }
    return createRlt;
  }
}
