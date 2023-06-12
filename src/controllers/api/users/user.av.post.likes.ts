import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";

import {
  ListData,
  ListQueryDto,
  ListQuerySchema,
  MController,
} from "../../../lib";
import { UserAvPostLikeService } from "../../../services";
import { UserAvPostLike } from "../../../models";

import * as hapi from "@hapi/hapi";
import {
  CreateUserAvPostLikeDto,
  CreateUserAvPostLikeSchema,
  UpdateUserAvPostLikeDto,
  UpdateUserAvPostLikeSchema,
} from "../../../dtos";
import Joi from "joi";

@Service()
@controller("/api/users/{userId}/user_av_post_likes")
export class UserUserAvPostLikesController extends MController {
  @Inject(() => UserAvPostLikeService)
  avPostCommentService!: UserAvPostLikeService;

  @get("/")
  @options({
    tags: ["api", "UserAvPostLike"],
    description: "查询UserAvPostLike列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<UserAvPostLike>> {
    const query = req.query as ListQueryDto;
    const { userId } = req.params;
    const listQuery = this.parseListQuery<UserAvPostLike>(query);
    return this.avPostCommentService.getUserAvPostLikeList({
      ...listQuery,
      filter: {
        ...listQuery.filter,
        userId,
      },
    });
  }

  @get("/{id}")
  @options({
    tags: ["api", "UserAvPostLike详情"],
    description: "查询UserAvPostLike详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<UserAvPostLike> {
    return this.avPostCommentService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建UserAvPostLike",
    notes: "返回UserAvPostLike数据",
    tags: ["api", "UserAvPostLike"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },

    validate: {
      payload: CreateUserAvPostLikeSchema,
    },
  })
  async create(req: hapi.Request): Promise<UserAvPostLike | undefined> {
    const input = req.payload as CreateUserAvPostLikeDto;
    const { userId } = req.params;
    return this.avPostCommentService.createUserAvPostLike(userId as string, {
      ...input,
    });
  }

  @route("delete", "/")
  @options({
    description: "删除UserAvPostLike",
    notes: "返回UserAvPostLike数据",
    tags: ["api", "UserAvPostLike"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.avPostCommentService.deleteUserAvPostLikes(JSON.parse(ids));
  }

  @route("delete", "/{id}")
  @options({
    description: "删除UserAvPostLike",
    notes: "返回UserAvPostLike数据",
    tags: ["api", "UserAvPostLike"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteOne(req: hapi.Request): Promise<UserAvPostLike> {
    const id = req.params.id as string;
    return this.avPostCommentService.deleteOneUserAvPostLike(id);
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
      payload: UpdateUserAvPostLikeSchema,
    },
  })
  async updateUserAvPostLike(req: hapi.Request) {
    const id = req.params.id;
    return this.avPostCommentService.updateUserAvPostLike(
      id,
      req.payload as UpdateUserAvPostLikeDto
    );
  }
}
