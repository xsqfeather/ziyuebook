import { controller, get, options, post, route, put } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { ChatMsg } from "../../models";
import { ChatMsgService } from "../../services";
import * as hapi from "@hapi/hapi";
import {
  CreateChatMsgDto,
  CreateChatMsgSchema,
  UpdateChatMsgDto,
  UpdateChatMsgSchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/chat_msgs")
export class ChatMsgApiController extends MController {
  @Inject(() => ChatMsgService)
  ChatMsgService!: ChatMsgService;

  @get("/")
  @options({
    tags: ["api", "ChatMsg"],
    description: "查询ChatMsg列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<ChatMsg>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<ChatMsg>(query);
    return this.ChatMsgService.getChatMsgList(listQuery);
  }

  @get("/{id}")
  @options({
    tags: ["api", "ChatMsg详情"],
    description: "查询ChatMsg详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<ChatMsg> {
    return this.ChatMsgService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建ChatMsg",
    notes: "返回ChatMsg数据",
    tags: ["api", "ChatMsg"],
    auth: {
      strategy: "jwt",
      scope: ["user", "admin"],
    },

    validate: {
      payload: CreateChatMsgSchema,
      failAction: (req, h, err) => {
        console.error(err);
        throw err;
      },
    },
  })
  async create(req: hapi.Request): Promise<ChatMsg | undefined> {
    const input = req.payload as CreateChatMsgDto;
    return this.ChatMsgService.createChatMsg(input);
  }

  @route("delete", "/")
  @options({
    description: "删除ChatMsg",
    notes: "返回ChatMsg数据",
    tags: ["api", "ChatMsg"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.ChatMsgService.deleteChatMsgs(JSON.parse(ids));
  }

  @route("delete", "/{id}")
  @options({
    description: "删除ChatMsg",
    notes: "返回ChatMsg数据",
    tags: ["api", "ChatMsg"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteOne(req: hapi.Request): Promise<ChatMsg> {
    const id = req.params.id as string;
    return this.ChatMsgService.deleteOneChatMsg(id);
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
      payload: UpdateChatMsgSchema,
    },
  })
  async updateChatMsg(req: hapi.Request) {
    const id = req.params.id;
    return this.ChatMsgService.updateChatMsg(
      id,
      req.payload as UpdateChatMsgDto
    );
  }
}
