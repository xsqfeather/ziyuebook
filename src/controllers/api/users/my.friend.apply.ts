import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";

import {
  ListData,
  ListQueryDto,
  ListQuerySchema,
  MController,
} from "../../../lib";
import { UserApplyService } from "../../../services";
import { UserApply } from "../../../models";

import * as hapi from "@hapi/hapi";
import {
  CreateUserApplyDto,
  CreateUserApplySchema,
  UpdateUserApplyDto,
  UpdateUserApplySchema,
} from "../../../dtos";
import Joi from "joi";

@Service()
@controller("/api/users/{userId}/friend-applies")
export class MyFriendApplyController extends MController {
  @Inject(() => UserApplyService)
  notificationService!: UserApplyService;

  @get("/")
  @options({
    tags: ["api", "我发起的好友请求"],
    description: "查询我发起的好友请求",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}", "admin"],
    },
  })
  async list(req: hapi.Request): Promise<ListData<UserApply>> {
    const query = req.query as ListQueryDto;
    const { userId } = req.params;
    const listQuery = this.parseListQuery<UserApply>(query);
    return this.notificationService.getUserApplyList({
      ...listQuery,
      filter: {
        ...listQuery.filter,
        fromUserId: userId,
      },
    });
  }

  @get("/{id}")
  @options({
    tags: ["api", "我发起的好友请求"],
    description: "查询我发起的好友请求",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<UserApply> {
    return this.notificationService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建用户的我发起的好友请求",
    notes: "返回UserApply数据",
    tags: ["api", "我发起的好友请求"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },

    validate: {
      payload: CreateUserApplySchema,
      params: Joi.object({
        userId: Joi.string().required(),
      }),
    },
  })
  async create(req: hapi.Request): Promise<UserApply | undefined> {
    const input = req.payload as CreateUserApplyDto;
    const { userId } = req.params;
    return this.notificationService.createUserApply({
      ...input,
      fromUserId: userId,
    });
  }

  @route("delete", "/")
  @options({
    description: "删除我发起的好友请求",
    notes: "返回UserApply数据",
    tags: ["api", "我发起的好友请求"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.notificationService.deleteUserApplies(JSON.parse(ids));
  }

  @route("delete", "/{id}")
  @options({
    description: "删除我发起的好友请求",
    notes: "返回UserApply数据",
    tags: ["api", "我发起的好友请求"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteOne(req: hapi.Request): Promise<UserApply> {
    const id = req.params.id as string;
    return this.notificationService.deleteUserApply(id);
  }

  @put("/{id}")
  @options({
    tags: ["api", "我发起的好友请求"],
    description: "更新分类详请",
    notes: "AV分类标签",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
        userId: Joi.string().required(),
      }),
      payload: UpdateUserApplySchema,
    },
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },
  })
  async updateUserApply(req: hapi.Request) {
    const id = req.params.id;
    return this.notificationService.updateUserApply(
      id,
      req.payload as UpdateUserApplyDto
    );
  }
}
