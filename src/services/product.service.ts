import { Product, ProductModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import { GetListQuery, ListData } from "../lib";
import Boom from "@hapi/boom";

@Service()
export class ProductService extends BaseService<Product> {
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
}
