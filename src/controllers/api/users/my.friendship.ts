import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";

import {
  ListData,
  ListQueryDto,
  ListQuerySchema,
  MController,
} from "../../../lib";
import { FriendshipService } from "../../../services";
import { Friendship } from "../../../models";

import * as hapi from "@hapi/hapi";
import {
  CreateFriendshipDto,
  CreateFriendshipSchema,
  UpdateFriendshipDto,
  UpdateFriendshipSchema,
} from "../../../dtos";
import Joi from "joi";

@Service()
@controller("/api/users/{userId}/friendships")
export class MyFriendshipController extends MController {
  @Inject(() => FriendshipService)
  notificationService!: FriendshipService;

  @get("/")
  @options({
    tags: ["api", "用户Friendship"],
    description: "查询Friendship列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}", "admin"],
    },
  })
  async list(req: hapi.Request): Promise<ListData<Friendship>> {
    const query = req.query as ListQueryDto;
    const { userId } = req.params;
    const listQuery = this.parseListQuery<Friendship>(query);
    return this.notificationService.getFriendshipList({
      ...listQuery,
      filter: {
        ...listQuery.filter,
        friendIds: {
          ...(listQuery.filter?.friendIds ?? {}),
          $all: [userId],
        },
      },
    });
  }

  @get("/{id}")
  @options({
    tags: ["api", "用户Friendship"],
    description: "查询Friendship详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}", "admin"],
    },
  })
  async getOne(req: hapi.Request): Promise<Friendship> {
    return this.notificationService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建用户的Friendship详情",
    notes: "返回Friendship数据",
    tags: ["api", "用户Friendship"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },

    validate: {
      payload: CreateFriendshipSchema,
    },
  })
  async create(req: hapi.Request): Promise<Friendship | undefined> {
    const input = req.payload as CreateFriendshipDto;
    const { userId } = req.params;
    return this.notificationService.createFriendship({
      ...input,
    });
  }

  @route("delete", "/")
  @options({
    description: "删除Friendship",
    notes: "返回Friendship数据",
    tags: ["api", "用户Friendship"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.notificationService.deleteFriendships(JSON.parse(ids));
  }

  @route("delete", "/{id}")
  @options({
    description: "删除Friendship",
    notes: "返回Friendship数据",
    tags: ["api", "用户Friendship"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteOne(req: hapi.Request): Promise<Friendship> {
    const id = req.params.id as string;
    return this.notificationService.deleteFriendship(id);
  }

  @put("/{id}")
  @options({
    tags: ["api", "用户Friendship"],
    description: "更新分类详请",
    notes: "AV分类标签",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
        userId: Joi.string().required(),
      }),
      payload: UpdateFriendshipSchema,
    },
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },
  })
  async updateFriendship(req: hapi.Request) {
    const id = req.params.id;
    return this.notificationService.updateFriendship(
      id,
      req.payload as UpdateFriendshipDto
    );
  }
}
