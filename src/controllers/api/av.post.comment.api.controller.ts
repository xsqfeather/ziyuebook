import { controller, get, options, post, route, put } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { AvPostComment } from "../../models";
import { AvPostCommentService } from "../../services";
import * as hapi from "@hapi/hapi";
import {
  CreateAvPostCommentDto,
  CreateAvPostCommentSchema,
  UpdateAvPostCommentDto,
  UpdateAvPostCommentSchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/av_post_comments")
export class AvPostCommentApiController extends MController {
  @Inject(() => AvPostCommentService)
  AvPostCommentService!: AvPostCommentService;

  @get("/")
  @options({
    tags: ["api", "AvPostComment"],
    description: "查询AvPostComment列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<AvPostComment>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<AvPostComment>(query);
    return this.AvPostCommentService.getAvPostCommentList(listQuery);
  }

  @get("/{id}")
  @options({
    tags: ["api", "AvPostComment详情"],
    description: "查询AvPostComment详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<AvPostComment> {
    return this.AvPostCommentService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建AvPostComment",
    notes: "返回AvPostComment数据",
    tags: ["api", "AvPostComment"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },

    validate: {
      payload: CreateAvPostCommentSchema,
    },
  })
  async create(req: hapi.Request): Promise<AvPostComment | undefined> {
    const input = req.payload as CreateAvPostCommentDto;
    const { userId } = req.auth.credentials;
    return this.AvPostCommentService.createAvPostComment(
      userId as string,
      input
    );
  }

  @route("delete", "/")
  @options({
    description: "删除AvPostComment",
    notes: "返回AvPostComment数据",
    tags: ["api", "AvPostComment"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.AvPostCommentService.deleteAvPostComments(JSON.parse(ids));
  }

  @route("delete", "/{id}")
  @options({
    description: "删除AvPostComment",
    notes: "返回AvPostComment数据",
    tags: ["api", "AvPostComment"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteOne(req: hapi.Request): Promise<AvPostComment> {
    const id = req.params.id as string;
    return this.AvPostCommentService.deleteOneAvPostComment(id);
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
      payload: UpdateAvPostCommentSchema,
    },
  })
  async updateAvPostComment(req: hapi.Request) {
    const id = req.params.id;
    return this.AvPostCommentService.updateAvPostComment(
      id,
      req.payload as UpdateAvPostCommentDto
    );
  }
}
