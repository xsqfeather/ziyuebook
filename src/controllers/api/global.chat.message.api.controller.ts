import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { GlobalChatMessage } from "../../models";
import { GlobalChatMessageService } from "../../services";
import * as hapi from "@hapi/hapi";

import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";
import {
  CreateGlobalChatMessageDto,
  CreateGlobalChatMessageSchema,
  UpdateGlobalChatMessageDto,
  UpdateGlobalChatMessageSchema,
} from "../../dtos";

@Service()
@controller("/api/global-chat-messages")
export class GlobalChatMessageApiController extends MController {
  @Inject(() => GlobalChatMessageService)
  avStarService!: GlobalChatMessageService;

  @get("/")
  @options({
    tags: ["api", "微博"],
    description: "查询分类列表",
    notes: "返回微博",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<GlobalChatMessage>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<GlobalChatMessage>(query);
    return this.avStarService.getGlobalChatMessageList(listQuery);
  }

  @post("/")
  @options({
    description: "新建演员",
    notes: "返回演员数据",
    tags: ["api", "微博"],
    auth: {
      strategy: "jwt",
      scope: ["admin", "user"],
    },

    validate: {
      payload: CreateGlobalChatMessageSchema,
      failAction: (req, h, err) => {
        console.error(err);
        throw err;
      },
    },
  })
  async create(req: hapi.Request): Promise<GlobalChatMessage> {
    const input = req.payload as CreateGlobalChatMessageDto;
    return this.avStarService.createGlobalChatMessage(input);
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
    return this.avStarService.deleteGlobalChatMessages(id);
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
  async getOne(req: hapi.Request): Promise<GlobalChatMessage> {
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
    return this.avStarService.deleteGlobalChatMessages(JSON.parse(ids));
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
      payload: UpdateGlobalChatMessageSchema,
    },
  })
  async updateAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.avStarService.updateGlobalChatMessage(
      id,
      req.payload as UpdateGlobalChatMessageDto
    );
  }
}
