import { CreateLinePostDto, UpdateLinePostDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { LinePost, LinePostModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
@Service()
export class LinePostService extends BaseService<LinePost> {
  async updateLinePost(id: string, input: UpdateLinePostDto) {
    try {
      const avTag = await LinePostModel.findOne({ id });
      if (!avTag) {
        throw Boom.notFound("该标签不存在");
      }
      const updatedLinePost = await LinePostModel.findOneAndUpdate(
        { id },
        {
          $set: {
            ...input,
            langs:
              (input.locale && (!input.langs as any)[input.locale]) ||
              (input.langs as any)[input?.locale || "en"] === ""
                ? {
                    ...input.langs,
                    [input.locale || "en"]: input.name,
                  }
                : input.langs,
          },
        }
      );

      return updatedLinePost;
    } catch (error) {
      console.error(error);
    }
  }
  public async getOne(id: string) {
    const avTag = await LinePostModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该演员不存在");
    }
    return avTag;
  }
  public async getLinePostList(
    input: GetListQuery<LinePost>
  ): Promise<ListData<LinePost>> {
    const { data, total } = await this.getListData<LinePost>(
      LinePostModel,
      input,
      ["name"]
    );
    return {
      data,
      total,
    };
  }

  public async createLinePost(input: CreateLinePostDto): Promise<LinePost> {
    const star = await LinePostModel.create(input);
    return star;
  }

  public async deleteLinePost(id: string): Promise<LinePost | null> {
    const star = await LinePostModel.findOneAndDelete({ id });
    if (!star) {
      throw Boom.notFound("Star Not Found");
    }
    return star;
  }
  public async deleteLinePosts(checkedIds: string[]) {
    await LinePostModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }
}
