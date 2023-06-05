import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";

import {
  ListData,
  ListQueryDto,
  ListQuerySchema,
  MController,
} from "../../../lib";
import { AvPostCommentService } from "../../../services";
import { AvPostComment } from "../../../models";

import { Request } from "@hapi/hapi";
import {
  CreateAvPostCommentDto,
  CreateAvPostCommentSchema,
  UpdateAvPostCommentDto,
  UpdateAvPostCommentSchema,
} from "../../../dtos";
import Joi from "joi";

@Service()
@controller("/api/users/{userId}/av_post_comments")
export class UserAvPostCommentsController extends MController {
  @Inject(() => AvPostCommentService)
  avPostCommentService!: AvPostCommentService;

  @get("/")
  @options({
    tags: ["api", "AvPostComment"],
    description: "查询AvPostComment列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: Request): Promise<ListData<AvPostComment>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<AvPostComment>(query);
    return this.avPostCommentService.getAvPostCommentList(listQuery);
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
  async getOne(req: Request): Promise<AvPostComment> {
    return this.avPostCommentService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建AvPostComment",
    notes: "返回AvPostComment数据",
    tags: ["api", "AvPostComment"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },

    validate: {
      payload: CreateAvPostCommentSchema,
    },
  })
  async create(req: Request): Promise<AvPostComment> {
    const input = req.payload as CreateAvPostCommentDto;
    const { id, name, role } = req.auth.credentials;
    console.log({ id, name, role });
    return this.avPostCommentService.createAvPostComment(id as string, {
      ...input,
    });
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
  async deleteMany(req: Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.avPostCommentService.deleteAvPostComments(JSON.parse(ids));
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
  async deleteOne(req: Request): Promise<AvPostComment> {
    const id = req.params.id as string;
    return this.avPostCommentService.deleteOneAvPostComment(id);
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
  async updateAvPostComment(req: Request) {
    const id = req.params.id;
    return this.avPostCommentService.updateAvPostComment(
      id,
      req.payload as UpdateAvPostCommentDto
    );
  }
}
