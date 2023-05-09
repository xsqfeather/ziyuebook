import { CreateUserAvActorLikeDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { UserAvActorLike, UserAvActorLikeModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";

@Service()
export class UserAvActorLikeService extends BaseService<UserAvActorLike> {
  public async getUserAvActorLikeList(
    input: GetListQuery<UserAvActorLike>
  ): Promise<ListData<UserAvActorLike>> {
    const { data, total } = await this.getListData<UserAvActorLike>(
      UserAvActorLikeModel,
      input,
      ["title"]
    );
    return {
      data,
      total,
    };
  }

  public async createUserAvActorLike(
    input: CreateUserAvActorLikeDto
  ): Promise<UserAvActorLike> {
    const article = await UserAvActorLikeModel.create(input);
    return article;
  }
}
