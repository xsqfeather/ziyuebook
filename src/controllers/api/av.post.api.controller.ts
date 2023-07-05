import {
  controller,
  get,
  options,
  patch,
  post,
  put,
  route,
} from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { AvPost } from "../../models";
import { AvPostService } from "../../services";
import * as hapi from "@hapi/hapi";
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
  async list(req: hapi.Request): Promise<ListData<AvPost>> {
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
  async getOne(req: hapi.Request): Promise<AvPost | null> {
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
      failAction: (req, h, err) => {
        console.error(err);
        throw err;
      },
    },
  })
  async create(req: hapi.Request): Promise<AvPost> {
    const input = req.payload as CreateAvPostDto;
    return this.avPostService.createAvPost(input);
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "商品"],
    description: "删除商品",
    notes: "测试",
  })
  async delete(req: hapi.Request): Promise<any> {
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
      failAction: (req, h, err) => {
        console.error(err);
        throw err;
      },
    },
  })
  async updateAvPost(req: hapi.Request) {
    const id = req.params.id;
    return this.avPostService.updateAvPost(id, req.payload as UpdateAvPostDto);
  }

  @patch("/{id}")
  @options({
    tags: ["api", "AV影片"],
    description: "更新影片详请",
    notes: "AV影片",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: Joi.object({
        hot: Joi.number().optional(),
      }),
    },
  })
  async patchAvPost(req: hapi.Request) {
    const id = req.params.id;
    return this.avPostService.patchAvPost(id, req.payload as UpdateAvPostDto);
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
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.avPostService.deleteAvPosts(JSON.parse(ids));
  }
}
