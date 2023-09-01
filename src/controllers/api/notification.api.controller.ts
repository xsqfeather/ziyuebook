import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { Notification } from "../../models";
import { NotificationService } from "../../services";
import * as hapi from "@hapi/hapi";
import {
  CreateNotificationDto,
  CreateNotificationSchema,
  UpdateNotificationDto,
  UpdateNotificationSchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/notifications")
export class NotificationApiController extends MController {
  @Inject(() => NotificationService)
  avStarService!: NotificationService;

  @get("/")
  @options({
    tags: ["api", "微博"],
    description: "查询分类列表",
    notes: "返回微博",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<Notification>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<Notification>(query);
    return this.avStarService.getNotificationList(listQuery);
  }

  @post("/")
  @options({
    description: "新建演员",
    notes: "返回演员数据",
    tags: ["api", "微博"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },

    validate: {
      payload: CreateNotificationSchema,
      failAction: (req, h, err) => {
        console.error(err);
        throw err;
      },
    },
  })
  async create(req: hapi.Request): Promise<Notification> {
    const input = req.payload as CreateNotificationDto;
    return this.avStarService.createNotification(input);
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "微博"],
    description: "删除分类",
    notes: "返回微博详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
    },
  })
  async deleteAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.avStarService.deleteNotification(id);
  }

  @get("/{id}")
  @options({
    tags: ["api", "微博详情"],
    description: "查询微博详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<Notification> {
    return this.avStarService.getOne(req.params.id as string);
  }

  @route("delete", "/")
  @options({
    description: "删除微博",
    notes: "返回微博数据",
    tags: ["api", "微博"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.avStarService.deleteNotifications(JSON.parse(ids));
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
      payload: UpdateNotificationSchema,
    },
  })
  async updateAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.avStarService.updateNotification(
      id,
      req.payload as UpdateNotificationDto
    );
  }
}
