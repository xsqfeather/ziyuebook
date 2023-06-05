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
      const updatedAvTag = await AvStarModel.findOneAndUpdate(
        { id },
        {
          ...input,
          langs:
            (input.locale && (!input.langs as any)[input.locale]) ||
            (input.langs as any)[input.locale] === ""
              ? {
                  ...input.langs,
                  [input.locale]: input.name,
                }
              : input.langs,
        }
      );

      return updatedAvTag;
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
      "title",
    ]);
    return {
      data,
      total,
    };
  }

  public async createAvStar(input: CreateAvStarDto): Promise<AvStar> {
    try {
      const article = await AvStarModel.create(input);
      return article;
    } catch (error) {
      console.error(error);
      throw error;
    }
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
