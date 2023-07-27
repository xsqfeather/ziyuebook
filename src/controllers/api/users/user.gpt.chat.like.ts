import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";

import {
  ListData,
  ListQueryDto,
  ListQuerySchema,
  MController,
} from "../../../lib";
import { UserGptChatLikeService } from "../../../services";
import { UserGptChatLike } from "../../../models";

import * as hapi from "@hapi/hapi";
import {
  CreateUserGptChatLikeDto,
  CreateUserGptChatLikeSchema,
  UpdateUserGptChatLikeDto,
  UpdateUserGptChatLikeSchema,
} from "../../../dtos";
import Joi from "joi";

@Service()
@controller("/api/users/{userId}/user_gpt_chat_likes")
export class UserUserGptChatLikesController extends MController {
  @Inject(() => UserGptChatLikeService)
  avPostCommentService!: UserGptChatLikeService;

  @get("/")
  @options({
    tags: ["api", "UserGptChatLike"],
    description: "查询UserGptChatLike列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<UserGptChatLike>> {
    const query = req.query as ListQueryDto;
    const { userId } = req.params;
    const listQuery = this.parseListQuery<UserGptChatLike>(query);
    return this.avPostCommentService.getUserGptChatLikeList({
      ...listQuery,
      filter: {
        ...listQuery.filter,
        userId,
      },
    });
  }

  @get("/{id}")
  @options({
    tags: ["api", "UserGptChatLike详情"],
    description: "查询UserGptChatLike详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<UserGptChatLike> {
    return this.avPostCommentService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建UserGptChatLike",
    notes: "返回UserGptChatLike数据",
    tags: ["api", "UserGptChatLike"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },

    validate: {
      payload: CreateUserGptChatLikeSchema,
    },
  })
  async create(req: hapi.Request): Promise<UserGptChatLike | undefined> {
    const input = req.payload as CreateUserGptChatLikeDto;
    const { userId } = req.params;
    return this.avPostCommentService.createUserGptChatLike(userId as string, {
      ...input,
    });
  }

  @route("delete", "/")
  @options({
    description: "删除UserGptChatLike",
    notes: "返回UserGptChatLike数据",
    tags: ["api", "UserGptChatLike"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.avPostCommentService.deleteUserGptChatLikes(JSON.parse(ids));
  }

  @route("delete", "/{id}")
  @options({
    description: "删除UserGptChatLike",
    notes: "返回UserGptChatLike数据",
    tags: ["api", "UserGptChatLike"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteOne(req: hapi.Request): Promise<UserGptChatLike> {
    const id = req.params.id as string;
    return this.avPostCommentService.deleteOneUserGptChatLike(id);
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
      payload: UpdateUserGptChatLikeSchema,
    },
  })
  async updateUserGptChatLike(req: hapi.Request) {
    const id = req.params.id;
    return this.avPostCommentService.updateUserGptChatLike(
      id,
      req.payload as UpdateUserGptChatLikeDto
    );
  }
}
