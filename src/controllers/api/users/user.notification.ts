import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";

import {
  ListData,
  ListQueryDto,
  ListQuerySchema,
  MController,
} from "../../../lib";
import { NotificationService } from "../../../services";
import { Notification } from "../../../models";

import * as hapi from "@hapi/hapi";
import {
  CreateNotificationDto,
  CreateNotificationSchema,
  UpdateNotificationDto,
  UpdateNotificationSchema,
} from "../../../dtos";
import Joi from "joi";

@Service()
@controller("/api/users/{userId}/notifications")
export class UserNotificationController extends MController {
  @Inject(() => NotificationService)
  notificationService!: NotificationService;

  @get("/")
  @options({
    tags: ["api", "用户Notification"],
    description: "查询Notification列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}", "admin"],
    },
  })
  async list(req: hapi.Request): Promise<ListData<Notification>> {
    const query = req.query as ListQueryDto;
    const { userId } = req.params;
    const listQuery = this.parseListQuery<Notification>(query);
    return this.notificationService.getNotificationList({
      ...listQuery,
      filter: {
        ...listQuery.filter,
        toUserId: userId,
      },
    });
  }

  @get("/{id}")
  @options({
    tags: ["api", "用户Notification"],
    description: "查询Notification详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}", "admin"],
    },
  })
  async getOne(req: hapi.Request): Promise<Notification> {
    return this.notificationService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建用户的Notification详情",
    notes: "返回Notification数据",
    tags: ["api", "用户Notification"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },

    validate: {
      payload: CreateNotificationSchema,
    },
  })
  async create(req: hapi.Request): Promise<Notification | undefined> {
    const input = req.payload as CreateNotificationDto;
    const { userId } = req.params;
    return this.notificationService.createNotification({
      ...input,
      toUserId: userId,
    });
  }

  @route("delete", "/")
  @options({
    description: "删除Notification",
    notes: "返回Notification数据",
    tags: ["api", "用户Notification"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.notificationService.deleteNotifications(JSON.parse(ids));
  }

  @route("delete", "/{id}")
  @options({
    description: "删除Notification",
    notes: "返回Notification数据",
    tags: ["api", "用户Notification"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteOne(req: hapi.Request): Promise<Notification> {
    const id = req.params.id as string;
    return this.notificationService.deleteNotification(id);
  }

  @put("/{id}")
  @options({
    tags: ["api", "用户Notification"],
    description: "更新分类详请",
    notes: "AV分类标签",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
        userId: Joi.string().required(),
      }),
      payload: UpdateNotificationSchema,
    },
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },
  })
  async updateNotification(req: hapi.Request) {
    const id = req.params.id;
    return this.notificationService.updateNotification(
      id,
      req.payload as UpdateNotificationDto
    );
  }
}
