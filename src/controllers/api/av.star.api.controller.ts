import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { AvStar } from "../../models";
import { AvStarService } from "../../services";
import * as hapi from "@hapi/hapi";
import {
  CreateAvStarDto,
  CreateAvStarSchema,
  UpdateAvStarDto,
  UpdateAvStarSchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/av_stars")
export class AvStarApiController extends MController {
  @Inject(() => AvStarService)
  avStarService!: AvStarService;

  @get("/")
  @options({
    tags: ["api", "Av演员"],
    description: "查询分类列表",
    notes: "返回Av演员",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<AvStar>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<AvStar>(query);
    return this.avStarService.getAvStarList(listQuery);
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
      payload: CreateAvStarSchema,
      failAction: (_request, _h, err) => {
        console.error({ err });
        return "error";
      },
    },
  })
  async create(req: hapi.Request): Promise<AvStar> {
    const input = req.payload as CreateAvStarDto;
    return this.avStarService.createAvStar(input);
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "Av演员"],
    description: "删除分类",
    notes: "返回Av演员详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
    },
  })
  async deleteAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.avStarService.deleteAvStar(id);
  }

  @get("/{id}")
  @options({
    tags: ["api", "Av演员详情"],
    description: "查询Av演员详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<AvStar> {
    return this.avStarService.getOne(req.params.id as string);
  }

  @route("delete", "/")
  @options({
    description: "删除Av演员",
    notes: "返回Av演员数据",
    tags: ["api", "Av演员"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.avStarService.deleteAvStars(JSON.parse(ids));
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
      payload: UpdateAvStarSchema,
    },
  })
  async updateAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.avStarService.updateAvStar(id, req.payload as UpdateAvStarDto);
  }
}
