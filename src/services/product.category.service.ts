import { CreateProductCategoryDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { ProductCategory, ProductCategoryModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";

@Service()
export class ProductCategoryService extends BaseService<ProductCategory> {
  public async getProductCategoryList(
    input: GetListQuery<ProductCategory>
  ): Promise<ListData<ProductCategory>> {
    const { data, total } = await this.getListData<ProductCategory>(
      ProductCategoryModel,
      input,
      ["title"]
    );
    return {
      data,
      total,
    };
  }

  public async createProductCategory(
    input: CreateProductCategoryDto
  ): Promise<ProductCategory> {
    const article = await ProductCategoryModel.create(input);
    return article;
  }

  public async getOrCreateBookCategory() {
    const bookCategory = await ProductCategoryModel.findOne({
      name: "图书",
    });
    if (bookCategory) {
      return bookCategory;
    } else {
      const newBookCategory = await ProductCategoryModel.create({
        name: "图书",
      });
      return newBookCategory;
    }
  }
}
