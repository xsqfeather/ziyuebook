import { controller, get, options, post } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { UserAvActorLike } from "../../models";
import { UserAvActorLikeService } from "../../services";
import { Request } from "@hapi/hapi";
import {
  CreateUserAvActorLikeDto,
  CreateUserAvActorLikeSchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";

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
  async list(req: Request): Promise<ListData<UserAvActorLike>> {
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
      payload: CreateUserAvActorLikeSchema,
    },
  })
  async create(req: Request): Promise<UserAvActorLike> {
    const input = req.payload as CreateUserAvActorLikeDto;
    return this.articleService.createUserAvActorLike(input);
  }
}
