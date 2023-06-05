import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { AvPost } from "../../models";
import { AvPostService } from "../../services";
import { Request } from "@hapi/hapi";
import {
  CreateAvPostDto,
  CreateAvPostSchema,
  UpdateAvPostDto,
  UpdateAvPostDtoSchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/av_posts")
export class AvPostApiController extends MController {
  @Inject(() => AvPostService)
  avPostService!: AvPostService;

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
    return this.avPostService.getAvPostList(listQuery);
  }

  @get("/{id}")
  @options({
    tags: ["api", "Av影片详情"],
    description: "查询Av影片详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: Request): Promise<AvPost> {
    return this.avPostService.getOne(req.params.id as string);
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
    return this.avPostService.createAvPost(input);
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "商品"],
    description: "删除商品",
    notes: "测试",
  })
  async delete(req: Request): Promise<any> {
    const id = req.params.id;
    return this.avPostService.deleteAvPost(id);
  }

  @put("/{id}")
  @options({
    tags: ["api", "AV影片"],
    description: "更新影片详请",
    notes: "AV影片",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: UpdateAvPostDtoSchema,
    },
  })
  async updateAvPost(req: Request) {
    const id = req.params.id;
    return this.avPostService.updateAvPost(id, req.payload as UpdateAvPostDto);
  }

  @route("delete", "/")
  @options({
    description: "删除Av影片",
    notes: "返回Av影片数据",
    tags: ["api", "AV影片"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteMany(req: Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.avPostService.deleteAvPosts(JSON.parse(ids));
  }
}
