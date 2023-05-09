import { controller, get, options, post } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { UserAvPostLike } from "../../models";
import { UserAvPostLikeService } from "../../services";
import { Request } from "@hapi/hapi";
import {
  CreateUserAvPostLikeDto,
  CreateUserAvPostLikeSchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";

@Service()
@controller("/api/user_av_post_likes")
export class UserAvPostLikeApiController extends MController {
  @Inject(() => UserAvPostLikeService)
  articleService!: UserAvPostLikeService;

  @get("/")
  @options({
    tags: ["api", "文章"],
    description: "查询文章列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: Request): Promise<ListData<UserAvPostLike>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<UserAvPostLike>(query);
    return this.articleService.getUserAvPostLikeList(listQuery);
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
  async create(req: Request): Promise<UserAvPostLike> {
    const input = req.payload as CreateUserAvPostLikeDto;
    return this.articleService.createUserAvPostLike(input);
  }
}
