import { CreateAvPostDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { AvPost, AvPostModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";

@Service()
export class AvPostService extends BaseService<AvPost> {
  public async getAvPostList(
    input: GetListQuery<AvPost>
  ): Promise<ListData<AvPost>> {
    const { data, total } = await this.getListData<AvPost>(AvPostModel, input, [
      "title",
    ]);
    return {
      data,
      total,
    };
  }

  public async createAvPost(input: CreateAvPostDto): Promise<AvPost> {
    const article = await AvPostModel.create({
      ...input,
      tags: input.tags.map((tag) => tag.name.trim()),
    });
    return article;
  }

  public async deleteAvPost(id: string) {
    const article = await AvPostModel.findOneAndRemove({ id });
    return article;
  }
}
