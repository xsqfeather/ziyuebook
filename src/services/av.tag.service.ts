import { CreateAvTagDto, UpdateAvTagDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { AvTag, AvTagModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";

@Service()
export class AvTagService extends BaseService<AvTag> {
  public async getAvTagList(
    input: GetListQuery<AvTag>
  ): Promise<ListData<AvTag>> {
    const { data, total } = await this.getListData<AvTag>(AvTagModel, input, [
      "name",
      "description",
    ]);
    return {
      data,
      total,
    };
  }

  public async getOne(id: string) {
    const avTag = await AvTagModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    return avTag;
  }

  public async deleteAvTags(checkedIds: string[]) {
    await AvTagModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }

  public async deleteOneAvTag(id: string) {
    const avTag = await AvTagModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    await avTag.remove();
    return avTag;
  }

  public async createAvTag(input: CreateAvTagDto): Promise<AvTag | undefined> {
    try {
      const AvTag = await AvTagModel.create({
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
      return AvTag;
    } catch (error) {
      console.error(error);
    }
  }

  async updateAvTag(id: string, input: UpdateAvTagDto) {
    try {
      const avTag = await AvTagModel.findOne({ id });
      if (!avTag) {
        throw Boom.notFound("该标签不存在");
      }
      const updatedAvTag = await AvTagModel.findOneAndUpdate(
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
}
