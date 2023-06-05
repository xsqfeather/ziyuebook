import { CreateProductCategoryDto, UpdateProductCategoryDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { ProductCategory, ProductCategoryModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
import { Document } from "mongoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";

@Service()
export class ProductCategoryService extends BaseService<ProductCategory> {
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

  public async deleteById(id: string) {
    return ProductCategoryModel.findOneAndRemove({ id });
  }

  public async getProductCategoryList(
    input: GetListQuery<ProductCategory>
  ): Promise<ListData<ProductCategory>> {
    try {
      const { data, total } = await this.getListData<ProductCategory>(
        ProductCategoryModel,
        input,
        ["title"]
      );
      if (total === 0 && Object.keys(input.filter).length === 0) {
        const unCategory = await ProductCategoryModel.create({
          name: "默认分类",
          langs: {
            zh: "默认分类",
            en: "Default Category",
            "zh-TW": "默認分類",
            "zh-Hk": "默認分類",
          },
          description: "默认分类",
          isDefault: true,
        });
        return {
          data: [unCategory],
          total: 1,
        };
      }
      return {
        data,
        total,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async createProductCategory(
    input: CreateProductCategoryDto
  ): Promise<ProductCategory> {
    const ProductCategory = await ProductCategoryModel.create({
      ...input,
      langs:
        (input.locale && (!input.langs as any)[input.locale]) ||
        (input.langs as any)[input.locale] === ""
          ? {
              ...input.langs,
              [input.locale]: input.name,
            }
          : input.langs,
    });
    return ProductCategory;
  }

  public deleteSuperCategoryLinksWithOne(
    ProductCategory: Document<unknown, BeAnObject, ProductCategory> &
      ProductCategory,
    superProductCategory: Document<unknown, BeAnObject, ProductCategory> &
      ProductCategory
  ) {
    const superCategoryIndex = ProductCategory.superCategoryIds.indexOf(
      superProductCategory.id
    );
    ProductCategory.superCategoryIds.splice(superCategoryIndex, 1);
    const superCategoryIndex2 = ProductCategory.superCategories.indexOf(
      superProductCategory.name
    );
    ProductCategory.superCategories.splice(superCategoryIndex2, 1);
    const langs = Object.keys(superProductCategory.langs);
    for (let index = 0; index < langs.length; index++) {
      const lang = langs[index];
      const superCategoryIndex3 = ProductCategory.superCategoriesLangs[
        lang
      ].indexOf(superProductCategory.langs[lang]);
      ProductCategory.superCategoriesLangs[lang].splice(superCategoryIndex3, 1);
    }
    const subCategoryIndex = superProductCategory.subCategoryIds.indexOf(
      ProductCategory.id
    );
    superProductCategory.subCategoryIds.splice(subCategoryIndex, 1);
    const subCategoryIndex2 = superProductCategory.subCategories.indexOf(
      ProductCategory.name
    );
    superProductCategory.subCategories.splice(subCategoryIndex2, 1);
    const langs2 = Object.keys(ProductCategory.langs);
    for (let index = 0; index < langs2.length; index++) {
      const lang = langs2[index];
      const subCategoryIndex3 = superProductCategory.subCategoriesLangs[
        lang
      ].indexOf(ProductCategory.langs[lang]);
      superProductCategory.subCategoriesLangs[lang].splice(
        subCategoryIndex3,
        1
      );
    }
  }

  public createSuperCategoryLinksWithOne(
    ProductCategory: Document<unknown, BeAnObject, ProductCategory> &
      ProductCategory,
    superProductCategory: Document<unknown, BeAnObject, ProductCategory> &
      ProductCategory
  ) {
    ProductCategory.superCategoryIds = [
      ...(superProductCategory.superCategoryIds || []),
      superProductCategory.id,
    ];
    ProductCategory.superCategories = [
      ...(superProductCategory.superCategories || []),
      superProductCategory.name,
    ];
    ProductCategory.superCategoriesStr =
      (superProductCategory.superCategoriesStr || "") +
      superProductCategory.name +
      (Object(superProductCategory.langs).values || "").toString();
    const langs = Object.keys(superProductCategory.langs);
    for (let index = 0; index < langs.length; index++) {
      const lang = langs[index];
      if (
        ProductCategory?.superCategoriesLangs &&
        ProductCategory?.superCategoriesLangs[lang]
      ) {
        ProductCategory?.superCategoriesLangs[lang]?.push(
          superProductCategory.langs[lang]
        );
      } else {
        ProductCategory.superCategoriesLangs = {
          [lang]: [superProductCategory.langs[lang]],
        };
      }
    }
    superProductCategory.subCategories.push(ProductCategory.name);
    superProductCategory.subCategoriesStr =
      superProductCategory.subCategoriesStr +
      ProductCategory.name +
      Object(ProductCategory.langs).values?.toString();
    superProductCategory.subCategoryIds.push(ProductCategory.id);
    const langs2 = Object.keys(ProductCategory.langs);
    for (let index = 0; index < langs2.length; index++) {
      const lang = langs2[index];
      if (
        superProductCategory.subCategoriesLangs &&
        superProductCategory.subCategoriesLangs[lang]
      ) {
        superProductCategory.subCategoriesLangs[lang].push(
          ProductCategory.langs[lang]
        );
      } else {
        superProductCategory.subCategoriesLangs = {
          [lang]: [ProductCategory.langs[lang]],
        };
      }
    }
    ProductCategory.level = superProductCategory.level + 1;
    ProductCategory.superCategoryId = superProductCategory.id;
    console.log({ ProductCategory });
  }

  public async createSubProductCategory(
    superProductCategoryId: string,
    input: CreateProductCategoryDto
  ) {
    const superProductCategory = await ProductCategoryModel.findOne({
      id: superProductCategoryId,
    });
    if (!superProductCategory) {
      throw Boom.notFound("分类不存在");
    }
    const ProductCategory = new ProductCategoryModel({
      ...input,
      langs:
        (input.locale && (!input.langs as any)[input.locale]) ||
        (input.langs as any)[input.locale] === ""
          ? {
              ...input.langs,
              [input.locale]: input.name,
            }
          : input.langs,
    });
    this.createSuperCategoryLinksWithOne(ProductCategory, superProductCategory);
    console.log({ ProductCategory });
    await superProductCategory.save();
    await ProductCategory.save();
    return ProductCategory;
  }

  public async getProductCategory(id: string) {
    const ProductCategory = await ProductCategoryModel.findOne({ id });
    if (!ProductCategory) {
      throw Boom.notFound("分类不存在");
    }
    return ProductCategory;
  }

  async changeSuperCategory(
    ProductCategory: Document<unknown, BeAnObject, ProductCategory> &
      ProductCategory,
    superProductCategoryId: string
  ) {
    const superProductCategory = await ProductCategoryModel.findOne({
      id: superProductCategoryId,
    });
    const oldSuperProductCategory = await ProductCategoryModel.findOne({
      id: ProductCategory.superCategoryId,
    });
    if (!superProductCategory) {
      throw Boom.notFound("分类不存在");
    }
    if (oldSuperProductCategory) {
      this.deleteSuperCategoryLinksWithOne(
        ProductCategory,
        oldSuperProductCategory
      );
      await oldSuperProductCategory.save();
    }
    this.createSuperCategoryLinksWithOne(ProductCategory, superProductCategory);
    await superProductCategory.save();
    await ProductCategory.save();
  }

  public async updateProductCategory(
    id: string,
    input: UpdateProductCategoryDto
  ) {
    const ProductCategory = await ProductCategoryModel.findOne({ id });
    if (!ProductCategory) {
      throw Boom.notFound("分类不存在");
    }

    if (
      input.superCategoryId &&
      ProductCategory.superCategoryId !== input.superCategoryId
    ) {
      await this.changeSuperCategory(ProductCategory, input.superCategoryId);
    }
    if (input.name) {
      ProductCategory.name = input.name;
    }
    if (input.langs) {
      ProductCategory.langs =
        (input.locale && (!input.langs as any)[input.locale]) ||
        (input.langs as any)[input.locale] === ""
          ? {
              ...input.langs,
              [input.locale]: input.name,
            }
          : input.langs;
    }
    if (input.cover) {
      ProductCategory.cover = input.cover;
    }
    if (input.description) {
      ProductCategory.description = input.description;
    }
    await ProductCategory.save();
    return ProductCategory;
  }

  public async removeProductCategory(id: string) {
    const ProductCategory = await ProductCategoryModel.findOne({ id });

    if (!ProductCategory) {
      throw Boom.notFound("分类不存在");
    }
    if (ProductCategory.superCategoryId) {
      const superProductCategory = await ProductCategoryModel.findOne({ id });
      if (superProductCategory) {
        this.deleteSuperCategoryLinksWithOne(
          ProductCategory,
          superProductCategory
        );
        await superProductCategory.save();
      }
      await ProductCategoryModel.deleteMany({
        id: ProductCategory.superCategoryId,
      });
    }
    await ProductCategory.remove();
    return ProductCategory;
  }
}
