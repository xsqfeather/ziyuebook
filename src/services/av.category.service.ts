import { CreateAvCategoryDto, UpdateAvCategoryDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { AvCategory, AvCategoryModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
import { Document } from "mongoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";

@Service()
export class AvCategoryService extends BaseService<AvCategory> {
  public async getAvCategoryList(
    input: GetListQuery<AvCategory>
  ): Promise<ListData<AvCategory>> {
    try {
      const { data, total } = await this.getListData<AvCategory>(
        AvCategoryModel,
        input,
        ["title"]
      );
      if (total === 0 && Object.keys(input.filter).length === 0) {
        const unCategory = await AvCategoryModel.create({
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

  public async createAvCategory(
    input: CreateAvCategoryDto
  ): Promise<AvCategory> {
    const AvCategory = await AvCategoryModel.create({
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
    return AvCategory;
  }

  public deleteSuperCategoryLinksWithOne(
    avCategory: Document<unknown, BeAnObject, AvCategory> & AvCategory,
    superAvCategory: Document<unknown, BeAnObject, AvCategory> & AvCategory
  ) {
    const superCategoryIndex = avCategory.superCategoryIds.indexOf(
      superAvCategory.id
    );
    avCategory.superCategoryIds.splice(superCategoryIndex, 1);
    const superCategoryIndex2 = avCategory.superCategories.indexOf(
      superAvCategory.name
    );
    avCategory.superCategories.splice(superCategoryIndex2, 1);
    const langs = Object.keys(superAvCategory.langs);
    for (let index = 0; index < langs.length; index++) {
      const lang = langs[index];
      const superCategoryIndex3 = avCategory.superCategoriesLangs[lang].indexOf(
        superAvCategory.langs[lang]
      );
      avCategory.superCategoriesLangs[lang].splice(superCategoryIndex3, 1);
    }
    const subCategoryIndex = superAvCategory.subCategoryIds.indexOf(
      avCategory.id
    );
    superAvCategory.subCategoryIds.splice(subCategoryIndex, 1);
    const subCategoryIndex2 = superAvCategory.subCategories.indexOf(
      avCategory.name
    );
    superAvCategory.subCategories.splice(subCategoryIndex2, 1);
    const langs2 = Object.keys(avCategory.langs);
    for (let index = 0; index < langs2.length; index++) {
      const lang = langs2[index];
      const subCategoryIndex3 = superAvCategory.subCategoriesLangs[
        lang
      ].indexOf(avCategory.langs[lang]);
      superAvCategory.subCategoriesLangs[lang].splice(subCategoryIndex3, 1);
    }
  }

  public createSuperCategoryLinksWithOne(
    avCategory: Document<unknown, BeAnObject, AvCategory> & AvCategory,
    superAvCategory: Document<unknown, BeAnObject, AvCategory> & AvCategory
  ) {
    avCategory.superCategoryIds = [
      ...(superAvCategory.superCategoryIds || []),
      superAvCategory.id,
    ];
    avCategory.superCategories = [
      ...(superAvCategory.superCategories || []),
      superAvCategory.name,
    ];
    avCategory.superCategoriesStr =
      (superAvCategory.superCategoriesStr || "") +
      superAvCategory.name +
      (Object(superAvCategory.langs).values || "").toString();
    const langs = Object.keys(superAvCategory.langs);
    for (let index = 0; index < langs.length; index++) {
      const lang = langs[index];
      if (
        avCategory?.superCategoriesLangs &&
        avCategory?.superCategoriesLangs[lang]
      ) {
        avCategory?.superCategoriesLangs[lang]?.push(
          superAvCategory.langs[lang]
        );
      } else {
        avCategory.superCategoriesLangs = {
          [lang]: [superAvCategory.langs[lang]],
        };
      }
    }
    superAvCategory.subCategories.push(avCategory.name);
    superAvCategory.subCategoriesStr =
      superAvCategory.subCategoriesStr +
      avCategory.name +
      Object(avCategory.langs).values?.toString();
    superAvCategory.subCategoryIds.push(avCategory.id);
    const langs2 = Object.keys(avCategory.langs);
    for (let index = 0; index < langs2.length; index++) {
      const lang = langs2[index];
      if (
        superAvCategory.subCategoriesLangs &&
        superAvCategory.subCategoriesLangs[lang]
      ) {
        superAvCategory.subCategoriesLangs[lang].push(avCategory.langs[lang]);
      } else {
        superAvCategory.subCategoriesLangs = {
          [lang]: [avCategory.langs[lang]],
        };
      }
    }
    avCategory.level = superAvCategory.level + 1;
    avCategory.superCategoryId = superAvCategory.id;
    console.log({ avCategory });
  }

  public async createSubAvCategory(
    superAvCategoryId: string,
    input: CreateAvCategoryDto
  ) {
    const superAvCategory = await AvCategoryModel.findOne({
      id: superAvCategoryId,
    });
    if (!superAvCategory) {
      throw Boom.notFound("分类不存在");
    }
    const avCategory = new AvCategoryModel({
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
    this.createSuperCategoryLinksWithOne(avCategory, superAvCategory);
    console.log({ avCategory });
    await superAvCategory.save();
    await avCategory.save();
    return avCategory;
  }

  public async getAvCategory(id: string) {
    const avCategory = await AvCategoryModel.findOne({ id });
    if (!avCategory) {
      throw Boom.notFound("分类不存在");
    }
    return avCategory;
  }

  async changeSuperCategory(
    avCategory: Document<unknown, BeAnObject, AvCategory> & AvCategory,
    superAvCategoryId: string
  ) {
    const superAvCategory = await AvCategoryModel.findOne({
      id: superAvCategoryId,
    });
    const oldSuperAvCategory = await AvCategoryModel.findOne({
      id: avCategory.superCategoryId,
    });
    if (!superAvCategory) {
      throw Boom.notFound("分类不存在");
    }
    if (oldSuperAvCategory) {
      this.deleteSuperCategoryLinksWithOne(avCategory, oldSuperAvCategory);
      await oldSuperAvCategory.save();
    }
    this.createSuperCategoryLinksWithOne(avCategory, superAvCategory);
    await superAvCategory.save();
    await avCategory.save();
  }

  public async updateAvCategory(id: string, input: UpdateAvCategoryDto) {
    const avCategory = await AvCategoryModel.findOne({ id });
    if (!avCategory) {
      throw Boom.notFound("分类不存在");
    }

    if (
      input.superCategoryId &&
      avCategory.superCategoryId !== input.superCategoryId
    ) {
      await this.changeSuperCategory(avCategory, input.superCategoryId);
    }
    if (input.name) {
      avCategory.name = input.name;
    }
    if (input.langs) {
      avCategory.langs =
        (input.locale && (!input.langs as any)[input.locale]) ||
        (input.langs as any)[input.locale] === ""
          ? {
              ...input.langs,
              [input.locale]: input.name,
            }
          : input.langs;
    }
    if (input.cover) {
      avCategory.cover = input.cover;
    }
    if (input.description) {
      avCategory.description = input.description;
    }
    await avCategory.save();
    return avCategory;
  }

  public async removeAvCategory(id: string) {
    const avCategory = await AvCategoryModel.findOne({ id });

    if (!avCategory) {
      throw Boom.notFound("分类不存在");
    }
    if (avCategory.superCategoryId) {
      const superAvCategory = await AvCategoryModel.findOne({ id });
      if (superAvCategory) {
        this.deleteSuperCategoryLinksWithOne(avCategory, superAvCategory);
        await superAvCategory.save();
      }
      await AvCategoryModel.deleteMany({
        id: avCategory.superCategoryId,
      });
    }
    await avCategory.remove();
    return avCategory;
  }
}
