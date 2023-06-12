import { controller, get, options, post } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { UserAvActorLike } from "../../models";
import { UserAvActorLikeService } from "../../services";
import * as hapi from "@hapi/hapi";

import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import {
  CreateUserAvPostLikeDto,
  CreateUserAvPostLikeSchema,
} from "../../dtos";

@Service()
@controller("/api/articles")
export class UserAvActorLikeApiController extends MController {
  @Inject(() => UserAvActorLikeService)
  articleService!: UserAvActorLikeService;

  @get("/")
  @options({
    tags: ["api", "文章"],
    description: "查询文章列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<UserAvActorLike>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<UserAvActorLike>(query);
    return this.articleService.getUserAvActorLikeList(listQuery);
  }

  @post("/")
  @options({
    description: "新建文章",
    notes: "返回文章数据",
    tags: ["api", "文章"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },

    validate: {
      payload: CreateUserAvPostLikeSchema,
    },
  })
  async create(req: hapi.Request): Promise<UserAvActorLike> {
    const input = req.payload as CreateUserAvPostLikeDto;
    return this.articleService.createUserAvActorLike(input);
  }
}
