import { CreateArticleCategoryDto, UpdateArticleCategoryDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { ArticleCategory, ArticleCategoryModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
import { Document } from "mongoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";

@Service()
export class ArticleCategoryService extends BaseService<ArticleCategory> {
  public async getArticleCategoryList(
    input: GetListQuery<ArticleCategory>
  ): Promise<ListData<ArticleCategory>> {
    try {
      const { data, total } = await this.getListData<ArticleCategory>(
        ArticleCategoryModel,
        input,
        ["title"]
      );
      if (total === 0 && Object.keys(input.filter).length === 0) {
        const unCategory = await ArticleCategoryModel.create({
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

  public async createArticleCategory(
    input: CreateArticleCategoryDto
  ): Promise<ArticleCategory> {
    const ArticleCategory = await ArticleCategoryModel.create({
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
    return ArticleCategory;
  }

  public deleteSuperCategoryLinksWithOne(
    ArticleCategory: Document<unknown, BeAnObject, ArticleCategory> &
      ArticleCategory,
    superArticleCategory: Document<unknown, BeAnObject, ArticleCategory> &
      ArticleCategory
  ) {
    const superCategoryIndex = ArticleCategory.superCategoryIds.indexOf(
      superArticleCategory.id
    );
    ArticleCategory.superCategoryIds.splice(superCategoryIndex, 1);
    const superCategoryIndex2 = ArticleCategory.superCategories.indexOf(
      superArticleCategory.name
    );
    ArticleCategory.superCategories.splice(superCategoryIndex2, 1);
    const langs = Object.keys(superArticleCategory.langs);
    for (let index = 0; index < langs.length; index++) {
      const lang = langs[index];
      const superCategoryIndex3 = ArticleCategory.superCategoriesLangs[
        lang
      ].indexOf(superArticleCategory.langs[lang]);
      ArticleCategory.superCategoriesLangs[lang].splice(superCategoryIndex3, 1);
    }
    const subCategoryIndex = superArticleCategory.subCategoryIds.indexOf(
      ArticleCategory.id
    );
    superArticleCategory.subCategoryIds.splice(subCategoryIndex, 1);
    const subCategoryIndex2 = superArticleCategory.subCategories.indexOf(
      ArticleCategory.name
    );
    superArticleCategory.subCategories.splice(subCategoryIndex2, 1);
    const langs2 = Object.keys(ArticleCategory.langs);
    for (let index = 0; index < langs2.length; index++) {
      const lang = langs2[index];
      const subCategoryIndex3 = superArticleCategory.subCategoriesLangs[
        lang
      ].indexOf(ArticleCategory.langs[lang]);
      superArticleCategory.subCategoriesLangs[lang].splice(
        subCategoryIndex3,
        1
      );
    }
  }

  public createSuperCategoryLinksWithOne(
    ArticleCategory: Document<unknown, BeAnObject, ArticleCategory> &
      ArticleCategory,
    superArticleCategory: Document<unknown, BeAnObject, ArticleCategory> &
      ArticleCategory
  ) {
    ArticleCategory.superCategoryIds = [
      ...(superArticleCategory.superCategoryIds || []),
      superArticleCategory.id,
    ];
    ArticleCategory.superCategories = [
      ...(superArticleCategory.superCategories || []),
      superArticleCategory.name,
    ];
    ArticleCategory.superCategoriesStr =
      (superArticleCategory.superCategoriesStr || "") +
      superArticleCategory.name +
      (Object(superArticleCategory.langs).values || "").toString();
    const langs = Object.keys(superArticleCategory.langs);
    for (let index = 0; index < langs.length; index++) {
      const lang = langs[index];
      if (
        ArticleCategory?.superCategoriesLangs &&
        ArticleCategory?.superCategoriesLangs[lang]
      ) {
        ArticleCategory?.superCategoriesLangs[lang]?.push(
          superArticleCategory.langs[lang]
        );
      } else {
        ArticleCategory.superCategoriesLangs = {
          [lang]: [superArticleCategory.langs[lang]],
        };
      }
    }
    superArticleCategory.subCategories.push(ArticleCategory.name);
    superArticleCategory.subCategoriesStr =
      superArticleCategory.subCategoriesStr +
      ArticleCategory.name +
      Object(ArticleCategory.langs).values?.toString();
    superArticleCategory.subCategoryIds.push(ArticleCategory.id);
    const langs2 = Object.keys(ArticleCategory.langs);
    for (let index = 0; index < langs2.length; index++) {
      const lang = langs2[index];
      if (
        superArticleCategory.subCategoriesLangs &&
        superArticleCategory.subCategoriesLangs[lang]
      ) {
        superArticleCategory.subCategoriesLangs[lang].push(
          ArticleCategory.langs[lang]
        );
      } else {
        superArticleCategory.subCategoriesLangs = {
          [lang]: [ArticleCategory.langs[lang]],
        };
      }
    }
    ArticleCategory.level = superArticleCategory.level + 1;
    ArticleCategory.superCategoryId = superArticleCategory.id;
    console.log({ ArticleCategory });
  }

  public async createSubArticleCategory(
    superArticleCategoryId: string,
    input: CreateArticleCategoryDto
  ) {
    const superArticleCategory = await ArticleCategoryModel.findOne({
      id: superArticleCategoryId,
    });
    if (!superArticleCategory) {
      throw Boom.notFound("分类不存在");
    }
    const ArticleCategory = new ArticleCategoryModel({
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
    this.createSuperCategoryLinksWithOne(ArticleCategory, superArticleCategory);
    console.log({ ArticleCategory });
    await superArticleCategory.save();
    await ArticleCategory.save();
    return ArticleCategory;
  }

  public async getArticleCategory(id: string) {
    const ArticleCategory = await ArticleCategoryModel.findOne({ id });
    if (!ArticleCategory) {
      throw Boom.notFound("分类不存在");
    }
    return ArticleCategory;
  }

  async changeSuperCategory(
    ArticleCategory: Document<unknown, BeAnObject, ArticleCategory> &
      ArticleCategory,
    superArticleCategoryId: string
  ) {
    const superArticleCategory = await ArticleCategoryModel.findOne({
      id: superArticleCategoryId,
    });
    const oldSuperArticleCategory = await ArticleCategoryModel.findOne({
      id: ArticleCategory.superCategoryId,
    });
    if (!superArticleCategory) {
      throw Boom.notFound("分类不存在");
    }
    if (oldSuperArticleCategory) {
      this.deleteSuperCategoryLinksWithOne(
        ArticleCategory,
        oldSuperArticleCategory
      );
      await oldSuperArticleCategory.save();
    }
    this.createSuperCategoryLinksWithOne(ArticleCategory, superArticleCategory);
    await superArticleCategory.save();
    await ArticleCategory.save();
  }

  public async updateArticleCategory(
    id: string,
    input: UpdateArticleCategoryDto
  ) {
    const ArticleCategory = await ArticleCategoryModel.findOne({ id });
    if (!ArticleCategory) {
      throw Boom.notFound("分类不存在");
    }

    if (
      input.superCategoryId &&
      ArticleCategory.superCategoryId !== input.superCategoryId
    ) {
      await this.changeSuperCategory(ArticleCategory, input.superCategoryId);
    }
    if (input.name) {
      ArticleCategory.name = input.name;
    }
    if (input.langs) {
      ArticleCategory.langs =
        (input.locale && (!input.langs as any)[input.locale]) ||
        (input.langs as any)[input.locale] === ""
          ? {
              ...input.langs,
              [input.locale]: input.name,
            }
          : input.langs;
    }
    if (input.cover) {
      ArticleCategory.cover = input.cover;
    }
    if (input.description) {
      ArticleCategory.description = input.description;
    }
    await ArticleCategory.save();
    return ArticleCategory;
  }

  public async removeArticleCategory(id: string) {
    const ArticleCategory = await ArticleCategoryModel.findOne({ id });

    if (!ArticleCategory) {
      throw Boom.notFound("分类不存在");
    }
    if (ArticleCategory.superCategoryId) {
      const superArticleCategory = await ArticleCategoryModel.findOne({ id });
      if (superArticleCategory) {
        this.deleteSuperCategoryLinksWithOne(
          ArticleCategory,
          superArticleCategory
        );
        await superArticleCategory.save();
      }
      await ArticleCategoryModel.deleteMany({
        id: ArticleCategory.superCategoryId,
      });
    }
    await ArticleCategory.remove();
    return ArticleCategory;
  }
}
