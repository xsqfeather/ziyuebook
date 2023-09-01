import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { LinePost } from "../../models";
import { LinePostService } from "../../services";
import * as hapi from "@hapi/hapi";
import {
  CreateLinePostDto,
  CreateLinePostSchema,
  UpdateLinePostDto,
  UpdateLinePostSchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/line-posts")
export class LinePostApiController extends MController {
  @Inject(() => LinePostService)
  avStarService!: LinePostService;

  @get("/")
  @options({
    tags: ["api", "微博"],
    description: "查询分类列表",
    notes: "返回微博",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<LinePost>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<LinePost>(query);
    return this.avStarService.getLinePostList(listQuery);
  }

  @post("/")
  @options({
    description: "新建演员",
    notes: "返回演员数据",
    tags: ["api", "微博"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },

    validate: {
      payload: CreateLinePostSchema,
      failAction: (req, h, err) => {
        console.error(err);
        throw err;
      },
    },
  })
  async create(req: hapi.Request): Promise<LinePost> {
    const input = req.payload as CreateLinePostDto;
    return this.avStarService.createLinePost(input);
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "微博"],
    description: "删除分类",
    notes: "返回微博详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
    },
  })
  async deleteAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.avStarService.deleteLinePost(id);
  }

  @get("/{id}")
  @options({
    tags: ["api", "微博详情"],
    description: "查询微博详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<LinePost> {
    return this.avStarService.getOne(req.params.id as string);
  }

  @route("delete", "/")
  @options({
    description: "删除微博",
    notes: "返回微博数据",
    tags: ["api", "微博"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.avStarService.deleteLinePosts(JSON.parse(ids));
  }

  @put("/{id}")
  @options({
    tags: ["api", "AV标签"],
    description: "更新分类详请",
    notes: "AV分类标签",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: UpdateLinePostSchema,
    },
  })
  async updateAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.avStarService.updateLinePost(
      id,
      req.payload as UpdateLinePostDto
    );
  }
}
