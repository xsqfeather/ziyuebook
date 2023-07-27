import { CreateGptChatCommentDto, UpdateGptChatCommentDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import {
  GptChatComment,
  GptChatCommentModel,
  AvPostModel,
  UserModel,
  GptChatModel,
} from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";

@Service()
export class GptChatCommentService extends BaseService<GptChatComment> {
  public async getGptChatCommentList(
    input: GetListQuery<GptChatComment>
  ): Promise<ListData<GptChatComment>> {
    const { data, total } = await this.getListData<GptChatComment>(
      GptChatCommentModel,
      input,
      ["name", "description"]
    );
    return {
      data,
      total,
    };
  }

  public async getOne(id: string) {
    const avTag = await GptChatCommentModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    return avTag;
  }

  public async deleteGptChatComments(checkedIds: string[]) {
    await GptChatCommentModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }

  public async deleteOneGptChatComment(id: string) {
    const avTag = await GptChatCommentModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    await avTag.remove();
    return avTag;
  }

  public async createGptChatComment(
    userId: string,
    input: CreateGptChatCommentDto
  ): Promise<GptChatComment | undefined> {
    const GptChatComment = await GptChatCommentModel.create({
      ...input,
      userId,
    });
    if (input.referCommentId) {
      const refComment = await GptChatCommentModel.findOne({
        id: input.referCommentId,
      });
      if (!refComment) {
        throw Boom.badRequest("referCommentId不存在");
      }
      if (!input.referUserId || input.referUserId == "") {
        throw Boom.badRequest("当referCommentId存在, referUserId不能为空");
      }
      const referUser = await UserModel.findOne({ id: input.referUserId });
      if (!referUser) {
        throw Boom.badRequest("referUserId不存在");
      }
      await GptChatCommentModel.findOneAndUpdate(
        { id: input.referCommentId },
        {
          $inc: {
            replyCount: 1,
          },
        }
      );
    }
    if (input.gptChatIdId) {
      await GptChatModel.findOneAndUpdate(
        { id: input.gptChatIdId },
        {
          $inc: {
            commentsCount: 1,
          },
        }
      );
    }

    return GptChatComment;
  }

  async updateGptChatComment(id: string, input: UpdateGptChatCommentDto) {
    try {
      const avTag = await GptChatCommentModel.findOne({ id });
      if (!avTag) {
        throw Boom.notFound("该标签不存在");
      }
      const updatedGptChatComment = await GptChatCommentModel.findOneAndUpdate(
        { id },
        {
          ...input,
        }
      );

      return updatedGptChatComment;
    } catch (error) {
      console.error(error);
    }
  }
}
