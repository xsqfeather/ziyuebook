import { controller, get, options, post } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { AvActor } from "../../models";
import { AvActorService } from "../../services";
import { Request } from "@hapi/hapi";
import { CreateAvActorDto, CreateAvActorSchema } from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";

@Service()
@controller("/api/av_actors")
export class AvActorApiController extends MController {
  @Inject(() => AvActorService)
  articleService!: AvActorService;

  @get("/")
  @options({
    tags: ["api", "文章"],
    description: "查询文章列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: Request): Promise<ListData<AvActor>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<AvActor>(query);
    return this.articleService.getAvActorList(listQuery);
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
      payload: CreateAvActorSchema,
    },
  })
  async create(req: Request): Promise<AvActor> {
    const input = req.payload as CreateAvActorDto;
    return this.articleService.createAvActor(input);
  }
}
