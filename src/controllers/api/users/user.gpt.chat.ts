import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";

import {
  ListData,
  ListQueryDto,
  ListQuerySchema,
  MController,
} from "../../../lib";
import { GptChatService } from "../../../services";
import { GptChat } from "../../../models";

import * as hapi from "@hapi/hapi";
import {
  CreateGptChatDto,
  CreateGptChatSchema,
  UpdateGptChatDto,
  UpdateGptChatDtoSchema,
} from "../../../dtos";
import Joi from "joi";

@Service()
@controller("/api/users/{userId}/gpt_chats")
export class UserGptChatsController extends MController {
  @Inject(() => GptChatService)
  avPostCommentService!: GptChatService;

  @get("/")
  @options({
    tags: ["api", "GptChat"],
    description: "查询GptChat列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<GptChat>> {
    const query = req.query as ListQueryDto;
    const { userId } = req.params;
    const listQuery = this.parseListQuery<GptChat>(query);
    return this.avPostCommentService.getGptChatList({
      ...listQuery,
      filter: {
        ...listQuery.filter,
        userId,
      },
    });
  }

  @get("/{id}")
  @options({
    tags: ["api", "GptChat详情"],
    description: "查询GptChat详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<GptChat> {
    return this.avPostCommentService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建GptChat",
    notes: "返回GptChat数据",
    tags: ["api", "GptChat"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },

    validate: {
      payload: CreateGptChatSchema,
    },
  })
  async create(req: hapi.Request): Promise<GptChat | undefined> {
    const input = req.payload as CreateGptChatDto;
    const { userId } = req.params;
    return this.avPostCommentService.createGptChat({
      ...input,
      userId,
    });
  }

  @route("delete", "/")
  @options({
    description: "删除GptChat",
    notes: "返回GptChat数据",
    tags: ["api", "GptChat"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.avPostCommentService.deleteGptChats(JSON.parse(ids));
  }

  @route("delete", "/{id}")
  @options({
    description: "删除GptChat",
    notes: "返回GptChat数据",
    tags: ["api", "GptChat"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteOne(req: hapi.Request): Promise<GptChat> {
    const id = req.params.id as string;
    return this.avPostCommentService.deleteGptChat(id);
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
      payload: UpdateGptChatDtoSchema,
    },
  })
  async updateGptChat(req: hapi.Request) {
    const id = req.params.id;
    return this.avPostCommentService.updateGptChat(
      id,
      req.payload as UpdateGptChatDto
    );
  }
}
