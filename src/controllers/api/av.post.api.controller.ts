import { controller, get, options, post, route } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { AvPost } from "../../models";
import { AvPostService } from "../../services";
import { Request } from "@hapi/hapi";
import { CreateAvPostDto, CreateAvPostSchema } from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";

@Service()
@controller("/api/av_posts")
export class AvPostApiController extends MController {
  @Inject(() => AvPostService)
  articleService!: AvPostService;

  @get("/")
  @options({
    tags: ["api", "文章"],
    description: "查询文章列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: Request): Promise<ListData<AvPost>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<AvPost>(query);
    return this.articleService.getAvPostList(listQuery);
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
      payload: CreateAvPostSchema,
    },
  })
  async create(req: Request): Promise<AvPost> {
    const input = req.payload as CreateAvPostDto;
    return this.articleService.createAvPost(input);
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "商品"],
    description: "删除商品",
    notes: "测试",
  })
  async delete(req: Request): Promise<any> {
    const id = req.params.id;
    return this.articleService.deleteAvPost(id);
  }
}
