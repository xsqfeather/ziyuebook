import { CreateAvPostCommentDto, UpdateAvPostCommentDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { AvPostComment, AvPostCommentModel, AvPostModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";

@Service()
export class AvPostCommentService extends BaseService<AvPostComment> {
  public async getAvPostCommentList(
    input: GetListQuery<AvPostComment>
  ): Promise<ListData<AvPostComment>> {
    const { data, total } = await this.getListData<AvPostComment>(
      AvPostCommentModel,
      input,
      ["name", "description"]
    );
    return {
      data,
      total,
    };
  }

  public async getOne(id: string) {
    const avTag = await AvPostCommentModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    return avTag;
  }

  public async deleteAvPostComments(checkedIds: string[]) {
    await AvPostCommentModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }

  public async deleteOneAvPostComment(id: string) {
    const avTag = await AvPostCommentModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    await avTag.remove();
    return avTag;
  }

  public async createAvPostComment(
    userId: string,
    input: CreateAvPostCommentDto
  ): Promise<AvPostComment> {
    try {
      const AvPostComment = await AvPostCommentModel.create({
        ...input,
        userId,
      });
      if (input.referCommentId) {
        await AvPostCommentModel.findOneAndUpdate(
          { id: input.referCommentId },
          {
            $inc: {
              replyCount: 1,
            },
          }
        );
      }
      if (input.avPostId) {
        await AvPostModel.findOneAndUpdate(
          { id: input.avPostId },
          {
            $inc: {
              commentsCount: 1,
            },
          }
        );
      }
      return AvPostComment;
    } catch (error) {
      console.error(error);
    }
  }

  async updateAvPostComment(id: string, input: UpdateAvPostCommentDto) {
    try {
      const avTag = await AvPostCommentModel.findOne({ id });
      if (!avTag) {
        throw Boom.notFound("该标签不存在");
      }
      const updatedAvPostComment = await AvPostCommentModel.findOneAndUpdate(
        { id },
        {
          ...input,
        }
      );

      return updatedAvPostComment;
    } catch (error) {
      console.error(error);
    }
  }
}
