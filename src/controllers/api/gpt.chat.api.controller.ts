import {
  controller,
  get,
  options,
  patch,
  post,
  put,
  route,
} from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { GptChat } from "../../models";
import { GptChatService } from "../../services";
import * as hapi from "@hapi/hapi";
import {
  CreateGptChatDto,
  CreateGptChatSchema,
  UpdateGptChatDto,
  UpdateGptChatDtoSchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/gpt_chats")
export class GptChatApiController extends MController {
  @Inject(() => GptChatService)
  gptChatService!: GptChatService;

  @get("/")
  @options({
    tags: ["api", "文章"],
    description: "查询文章列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<GptChat>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<GptChat>(query);
    return this.gptChatService.getGptChatList({
      ...listQuery,
      filter: {
        ...listQuery.filter,
        isPublic: true,
      },
    });
  }

  @get("/{id}")
  @options({
    tags: ["api", "Av影片详情"],
    description: "查询Av影片详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<GptChat | null> {
    return this.gptChatService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建文章",
    notes: "返回文章数据",
    tags: ["api", "文章"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },

    validate: {
      payload: CreateGptChatSchema,
      failAction: (req, h, err) => {
        console.error(err);
        throw err;
      },
    },
  })
  async create(req: hapi.Request): Promise<GptChat> {
    const input = req.payload as CreateGptChatDto;
    return this.gptChatService.createGptChat(input);
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "商品"],
    description: "删除商品",
    notes: "测试",
  })
  async delete(req: hapi.Request): Promise<any> {
    const id = req.params.id;
    return this.gptChatService.deleteGptChat(id);
  }

  @put("/{id}")
  @options({
    tags: ["api", "GPT对话"],
    description: "更新影片详请",
    notes: "GPT对话",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: UpdateGptChatDtoSchema,
      failAction: (req, h, err) => {
        console.error(err);
        throw err;
      },
    },
  })
  async updateGptChat(req: hapi.Request) {
    const id = req.params.id;
    return this.gptChatService.updateGptChat(
      id,
      req.payload as UpdateGptChatDto
    );
  }

  @patch("/{id}")
  @options({
    tags: ["api", "GPT对话"],
    description: "更新影片详请",
    notes: "GPT对话",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: Joi.object({
        hot: Joi.number().optional(),
      }),
    },
  })
  async patchGptChat(req: hapi.Request) {
    const id = req.params.id;
    return this.gptChatService.patchGptChat(
      id,
      req.payload as UpdateGptChatDto
    );
  }

  @route("delete", "/")
  @options({
    description: "删除Av影片",
    notes: "返回Av影片数据",
    tags: ["api", "GPT对话"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.gptChatService.deleteGptChats(JSON.parse(ids));
  }
}
