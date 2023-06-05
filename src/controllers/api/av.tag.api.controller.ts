import { controller, get, options, post, route, put } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { AvTag } from "../../models";
import { AvTagService } from "../../services";
import { Request } from "@hapi/hapi";
import {
  CreateAvTagDto,
  CreateAvTagSchema,
  UpdateAvTagDto,
  UpdateAvTagSchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/av_tags")
export class AvTagApiController extends MController {
  @Inject(() => AvTagService)
  AvTagService!: AvTagService;

  @get("/")
  @options({
    tags: ["api", "AvTag"],
    description: "查询AvTag列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: Request): Promise<ListData<AvTag>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<AvTag>(query);
    return this.AvTagService.getAvTagList(listQuery);
  }

  @get("/{id}")
  @options({
    tags: ["api", "AvTag详情"],
    description: "查询AvTag详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: Request): Promise<AvTag> {
    return this.AvTagService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建AvTag",
    notes: "返回AvTag数据",
    tags: ["api", "AvTag"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },

    validate: {
      payload: CreateAvTagSchema,
    },
  })
  async create(req: Request): Promise<AvTag> {
    const input = req.payload as CreateAvTagDto;
    return this.AvTagService.createAvTag(input);
  }

  @route("delete", "/")
  @options({
    description: "删除AvTag",
    notes: "返回AvTag数据",
    tags: ["api", "AvTag"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteMany(req: Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.AvTagService.deleteAvTags(JSON.parse(ids));
  }

  @route("delete", "/{id}")
  @options({
    description: "删除AvTag",
    notes: "返回AvTag数据",
    tags: ["api", "AvTag"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteOne(req: Request): Promise<AvTag> {
    const id = req.params.id as string;
    return this.AvTagService.deleteOneAvTag(id);
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
      payload: UpdateAvTagSchema,
    },
  })
  async updateAvTag(req: Request) {
    const id = req.params.id;
    return this.AvTagService.updateAvTag(id, req.payload as UpdateAvTagDto);
  }
}
