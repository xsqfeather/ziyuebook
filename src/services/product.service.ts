import { Product, ProductModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import { GetListQuery, ListData } from "../lib";

@Service()
export class ProductService extends BaseService<Product> {
  public async getProductList(
    input: GetListQuery<Product>
  ): Promise<ListData<Product>> {
    const { data, total } = await this.getListData<Product>(
      ProductModel,
      input,
      ["title", "ISBN"]
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
}
