import { CreateUserAvPostLikeDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { UserAvPostLike, UserAvPostLikeModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";

@Service()
export class UserAvPostLikeService extends BaseService<UserAvPostLike> {
  public async getUserAvPostLikeList(
    input: GetListQuery<UserAvPostLike>
  ): Promise<ListData<UserAvPostLike>> {
    const { data, total } = await this.getListData<UserAvPostLike>(
      UserAvPostLikeModel,
      input,
      ["title"]
    );
    return {
      data,
      total,
    };
  }

  public async createUserAvPostLike(
    input: CreateUserAvPostLikeDto
  ): Promise<UserAvPostLike> {
    const article = await UserAvPostLikeModel.create(input);
    return article;
  }
}
