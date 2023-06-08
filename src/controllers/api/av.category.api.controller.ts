import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { AvCategory } from "../../models";
import { AvCategoryService } from "../../services";
import * as hapi from "@hapi/hapi";
import {
  CreateAvCategoryDto,
  CreateAvCategorySchema,
  UpdateAvCategoryDto,
  UpdateAvCategorySchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/av_categories")
export class AvCategoryApiController extends MController {
  @Inject(() => AvCategoryService)
  AvCategoryService!: AvCategoryService;

  @get("/")
  @options({
    tags: ["api", "AV分类"],
    description: "查询分类列表",
    notes: "返回AV分类",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<AvCategory>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<AvCategory>(query);
    return this.AvCategoryService.getAvCategoryList(listQuery);
  }

  @get("/{id}")
  @options({
    tags: ["api", "AV分类"],
    description: "查询分类详请",
    notes: "返回AV分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
    },
  })
  async getAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.AvCategoryService.getAvCategory(id);
  }

  @post("/{id}")
  @options({
    tags: ["api", "新建AV子分类"],
    description: "查询分类详请",
    notes: "返回AV分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: CreateAvCategorySchema,
    },
  })
  async postSubCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.AvCategoryService.createSubAvCategory(
      id,
      req.payload as CreateAvCategoryDto
    );
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "AV分类"],
    description: "删除分类",
    notes: "返回AV分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
    },
  })
  async deleteAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.AvCategoryService.removeAvCategory(id);
  }

  @put("/{id}")
  @options({
    tags: ["api", "AV分类"],
    description: "更新分类详请",
    notes: "AV分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: UpdateAvCategorySchema,
    },
  })
  async updateAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.AvCategoryService.updateAvCategory(
      id,
      req.payload as UpdateAvCategoryDto
    );
  }

  @post("/")
  @options({
    description: "新建分类",
    notes: "返回分类",
    tags: ["api", "AV分类"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
    validate: {
      payload: CreateAvCategorySchema,
    },
  })
  async create(req: hapi.Request): Promise<AvCategory> {
    const input = req.payload as CreateAvCategoryDto;
    return this.AvCategoryService.createAvCategory(input);
  }
}
