import { CreateAvStarDto, UpdateAvStarDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { AvStar, AvStarModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
@Service()
export class AvStarService extends BaseService<AvStar> {
  async updateAvStar(id: string, input: UpdateAvStarDto) {
    try {
      const avTag = await AvStarModel.findOne({ id });
      if (!avTag) {
        throw Boom.notFound("该标签不存在");
      }
      const updatedAvStar = await AvStarModel.findOneAndUpdate(
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

      return updatedAvStar;
    } catch (error) {
      console.error(error);
    }
  }
  public async getOne(id: string) {
    const avTag = await AvStarModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该演员不存在");
    }
    return avTag;
  }
  public async getAvStarList(
    input: GetListQuery<AvStar>
  ): Promise<ListData<AvStar>> {
    const { data, total } = await this.getListData<AvStar>(AvStarModel, input, [
      "name",
    ]);
    return {
      data,
      total,
    };
  }

  public async createAvStar(input: CreateAvStarDto): Promise<AvStar> {
    const star = await AvStarModel.create(input);
    return star;
  }

  public async deleteAvStar(id: string): Promise<AvStar | null> {
    try {
      const article = await AvStarModel.findOneAndDelete({ id });
      if (!article) {
        throw Boom.notFound("Not Found");
      }
      return article;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  public async deleteAvStars(checkedIds: string[]) {
    await AvStarModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }
}
