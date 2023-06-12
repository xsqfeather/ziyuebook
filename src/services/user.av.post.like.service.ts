import { CreateUserAvPostLikeDto, UpdateUserAvPostLikeDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import {
  UserAvPostLike,
  UserAvPostLikeModel,
  AvPostModel,
  AvPost,
} from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";

@Service()
export class UserAvPostLikeService extends BaseService<UserAvPostLike> {
  public async getUserAvPostLikeList(
    input: GetListQuery<UserAvPostLike>
  ): Promise<ListData<UserAvPostLike>> {
    const { data, total } = await this.getListData<UserAvPostLike>(
      UserAvPostLikeModel,
      input,
      [
        "avPost.title",
        "avPost.description",
        "avPost.tagsStr",
        "avPost.categoryNameStr",
        "avPost.starsStr",
      ]
    );
    return {
      data,
      total,
    };
  }

  public async getOne(id: string) {
    const avTag = await UserAvPostLikeModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    return avTag;
  }

  public async deleteUserAvPostLikes(avPostIds: string[]) {
    await UserAvPostLikeModel.deleteMany({ avPostId: { $in: avPostIds } });
    await AvPostModel.updateMany(
      { id: { $in: avPostIds } },
      { $inc: { likeCount: -1 } }
    );
    return avPostIds;
  }

  public async deleteOneUserAvPostLike(id: string) {
    const avTag = await UserAvPostLikeModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    await avTag.remove();
    return avTag;
  }

  public async createUserAvPostLike(
    userId: string,
    input: CreateUserAvPostLikeDto
  ): Promise<UserAvPostLike | undefined> {
    const likeExist = await UserAvPostLikeModel.findOne({
      userId,
      avPostId: input.avPostId,
    });
    if (likeExist) {
      throw Boom.conflict("已经点赞过了");
    }
    try {
      const avPost = await AvPostModel.findOneAndUpdate(
        { id: input.avPostId },
        {
          $inc: { likeCount: 1 },
        }
      );
      const userAvPostLike = await UserAvPostLikeModel.create({
        ...input,
        userId,
        avPost,
      });

      return userAvPostLike;
    } catch (error) {
      console.error(error);
    }
  }

  async updateUserAvPostLike(id: string, input: UpdateUserAvPostLikeDto) {
    try {
      const avTag = await UserAvPostLikeModel.findOne({ id });
      if (!avTag) {
        throw Boom.notFound("该标签不存在");
      }
      const updatedUserAvPostLike = await UserAvPostLikeModel.findOneAndUpdate(
        { id },
        {
          ...input,
        }
      );

      return updatedUserAvPostLike;
    } catch (error) {
      console.error(error);
    }
  }
}
