import { CreateAvPostDto, UpdateAvPostDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import {
  AvCategoryModel,
  AvPost,
  AvPostModel,
  AvStarModel,
  AvTagModel,
} from "../models";
import { Inject, Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
import { AvCategoryService } from ".";

@Service()
export class AvPostService extends BaseService<AvPost> {
  @Inject(() => AvCategoryService)
  private readonly avCategoryService!: AvCategoryService;

  public async getAvPostList(
    input: GetListQuery<AvPost>
  ): Promise<ListData<AvPost>> {
    if (input.filter.categoryId) {
      const categoryIds = await this.avCategoryService.getSubSubCates([
        input.filter.categoryId,
      ]);
      input.filter = {
        ...input.filter,
        categoryId: {
          $in: categoryIds,
        },
      };
    }
    const { data, total } = await this.getListData<AvPost>(AvPostModel, input, [
      "title",
      "description",
      "tagsStr",
      "categoryNameStr",
      "starsStr",
    ]);
    return {
      data,
      total,
    };
  }

  public async getAvPostByCategory(categoryId: string, filter: any) {
    const data = await AvPostModel.find({
      $and: [
        {
          $or: [{ categoryId }, { "category.superCategoryIds": categoryId }],
        },
        ...filter,
      ],
    });
    const total = await AvPostModel.countDocuments({
      $and: [
        {
          $or: [{ categoryId }, { "category.superCategoryIds": categoryId }],
        },
        ...filter,
      ],
    });
    return {
      data,
      total,
    };
  }

  public async getOne(id: string) {
    return AvPostModel.findOne({ id });
  }

  public async createAvPost(input: CreateAvPostDto): Promise<AvPost> {
    const avPost = new AvPostModel();
    if (input.categoryId) {
      const category = await AvCategoryModel.findOne({ id: input.categoryId });
      if (!category) {
        throw Boom.notFound("该分类不存在");
      }
      avPost.categoryId = category.id;

      avPost.category = category;
    } else {
      const category = await AvCategoryModel.findOne({ isDefault: true });
      avPost.categoryId = category?.id;
      if (category) avPost.category = category;
    }

    if (input.tagIds) {
      const tags = await AvTagModel.find({ id: { $in: input.tagIds } });
      avPost.tags = tags.map((tag) => tag.name);
      avPost.tagsStr = tags
        .map((tag) => tag.name + Object.values(tag.langs).toString())
        .toString();
      avPost.tagIds = tags.map((tag) => tag.id);
    }
    if (input.starIds) {
      const stars = await AvStarModel.find({ id: { $in: input.starIds } });
      avPost.stars = stars.map((star) => star.name);
      avPost.starsStr = stars
        .map((star) => star.name + Object.values(star.langs).toString())
        .toString();
      avPost.starIds = stars.map((star) => star.id);
    }
    if (input.previewVideo) {
      avPost.previewVideo = input.previewVideo;
    }

    avPost.videoName = input.videoName;
    avPost.title = input.title;
    avPost.description = input.description;
    avPost.locale = input.locale;
    avPost.cover = input.cover;
    avPost.publishDate = input.publishDate || new Date();
    avPost.images = input.images || [];
    avPost.introduction = input.introduction;
    avPost.designator = input.designator;
    avPost.isFemaleFriendly = input.isFemaleFriendly;

    await avPost.save();
    return avPost;
  }

  public async deleteAvPosts(checkedIds: string[]) {
    await AvPostModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }

  public async patchAvPost(id: string, input: Partial<UpdateAvPostDto>) {
    return AvPostModel.findOneAndUpdate(
      { id },
      {
        $set: {
          ...input,
        },
      }
    );
  }

  async updateAvPost(id: string, input: UpdateAvPostDto) {
    const avPost = await AvPostModel.findOne({ id });
    if (!avPost) {
      throw Boom.notFound("该视频不存在");
    }
    if (input.categoryId) {
      const category = await AvCategoryModel.findOne({ id: input.categoryId });
      if (!category) {
        throw Boom.notFound("该分类不存在");
      }
      avPost.categoryId = category.id;
      avPost.category = category;
    } else {
      const category = await AvCategoryModel.findOne({ isDefault: true });
      avPost.categoryId = category?.id;
      if (category) {
        avPost.category = category;
      }
    }

    if (input.tagIds) {
      const tags = await AvTagModel.find({ id: { $in: input.tagIds } });
      avPost.tags = tags.map((tag) => tag.name);
      avPost.tagsStr = tags
        .map((tag) => tag.name + Object.values(tag.langs).toString())
        .toString();
      avPost.tagIds = tags.map((tag) => tag.id);
    }
    if (input.previewVideo) {
      avPost.previewVideo = input.previewVideo;
    }
    if (input.starIds) {
      const stars = await AvStarModel.find({ id: { $in: input.starIds } });
      avPost.stars = stars.map((star) => star.name);
      avPost.starsStr = stars
        .map((star) => star.name + Object.values(star.langs).toString())
        .toString();
      avPost.starIds = stars.map((star) => star.id);
    }

    avPost.videoName = input.videoName;
    avPost.title = input.title;
    avPost.description = input.description;
    avPost.locale = input.locale;
    avPost.cover = input.cover;
    avPost.publishDate = input.publishDate || new Date();
    avPost.images = input.images || [];
    avPost.introduction = input.introduction;
    avPost.designator = input.designator;
    avPost.isFemaleFriendly = input.isFemaleFriendly;

    await avPost.save();
    return avPost;
  }

  public async deleteAvPost(id: string) {
    const article = await AvPostModel.findOneAndRemove({ id });
    return article;
  }
}
