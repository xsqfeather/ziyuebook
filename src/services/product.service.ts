import { Product, ProductModel } from "../models";
import { Inject, Service } from "typedi";
import { BaseService } from "./base.service";
import { GetListQuery, ListData } from "../lib";
import Boom from "@hapi/boom";
import { XianProductCreateDto, XianProductEditDto } from "../dtos";
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

    return product;
  }

  public async putXianProduct(id: string, channel_cat_id: string) {
    const product = await ProductModel.findOne({ id });
    if (!product) {
      throw Boom.notFound("商品不存在");
    }
    let rlt = null;
    if (product.xianProductId && product.xianProductId !== "") {
      rlt = await this.updateXianProduct(
        product.xianProductId,
        product,
        channel_cat_id
      );
    } else {
      rlt = await this.createXianProduct(product, channel_cat_id);
    }

    return rlt;
  }

  public async updateXianProduct(
    xianProductId: string,
    product: Product,
    channel_cat_id: string
  ) {
    const updateXianProductInput = new XianProductEditDto();
    updateXianProductInput.product_id = xianProductId;
    updateXianProductInput.title = "【正版二手】" + product.title;
    updateXianProductInput.price = product.price;
    updateXianProductInput.stock = product.stock || 99;
    updateXianProductInput.channel_cat_id = channel_cat_id;
    updateXianProductInput.district_id = 510116;
    updateXianProductInput.images = product.images;
    return this.xianProductService.editXianProduct(updateXianProductInput);
  }

  public async createXianProduct(product: Product, channel_cat_id: string) {
    const createXianProductInput = new XianProductCreateDto();
    createXianProductInput.title = "【正版二手】" + product.title;
    createXianProductInput.price = product.price;
    createXianProductInput.stock = product.stock || 99;
    createXianProductInput.channel_cat_id = channel_cat_id;
    createXianProductInput.district_id = 510116;
    createXianProductInput.images = [
      ...product.images,
      "https://img2.sosotec.com/product/20230317/121901-3893ckjk.jpg",
    ];
    createXianProductInput.desc =
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
    createXianProductInput.stuff_status = 0;

    return this.xianProductService.createNewProduct(createXianProductInput);
  }
}
