import { CreateUserGptChatLikeDto, UpdateUserGptChatLikeDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { UserGptChatLike, UserGptChatLikeModel, GptChatModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";

@Service()
export class UserGptChatLikeService extends BaseService<UserGptChatLike> {
  public async getUserGptChatLikeList(
    input: GetListQuery<UserGptChatLike>
  ): Promise<ListData<UserGptChatLike>> {
    const { data, total } = await this.getListData<UserGptChatLike>(
      UserGptChatLikeModel,
      input,
      [
        "gptChat.title",
        "gptChat.description",
        "gptChat.tagsStr",
        "gptChat.categoryNameStr",
        "gptChat.starsStr",
      ]
    );
    return {
      data,
      total,
    };
  }

  public async getOne(id: string) {
    const avTag = await UserGptChatLikeModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    return avTag;
  }

  public async deleteUserGptChatLikes(gptChatIds: string[]) {
    await UserGptChatLikeModel.deleteMany({ gptChatId: { $in: gptChatIds } });
    await GptChatModel.updateMany(
      { id: { $in: gptChatIds } },
      { $inc: { likeCount: -1 } }
    );
    return gptChatIds;
  }

  public async deleteOneUserGptChatLike(id: string) {
    const avTag = await UserGptChatLikeModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    await avTag.remove();
    return avTag;
  }

  public async createUserGptChatLike(
    userId: string,
    input: CreateUserGptChatLikeDto
  ): Promise<UserGptChatLike | undefined> {
    const likeExist = await UserGptChatLikeModel.findOne({
      userId,
      gptChatId: input.gptChatId,
    });
    if (likeExist) {
      throw Boom.conflict("已经点赞过了");
    }
    try {
      const gptChat = await GptChatModel.findOneAndUpdate(
        { id: input.gptChatId },
        {
          $inc: { likeCount: 1 },
        }
      );
      const userGptChatLike = await UserGptChatLikeModel.create({
        ...input,
        userId,
        gptChat,
      });

      return userGptChatLike;
    } catch (error) {
      console.error(error);
    }
  }

  async updateUserGptChatLike(id: string, input: UpdateUserGptChatLikeDto) {
    try {
      const avTag = await UserGptChatLikeModel.findOne({ id });
      if (!avTag) {
        throw Boom.notFound("该标签不存在");
      }
      const updatedUserGptChatLike =
        await UserGptChatLikeModel.findOneAndUpdate(
          { id },
          {
            ...input,
          }
        );

      return updatedUserGptChatLike;
    } catch (error) {
      console.error(error);
    }
  }
}
