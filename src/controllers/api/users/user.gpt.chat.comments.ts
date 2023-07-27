import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";

import {
  ListData,
  ListQueryDto,
  ListQuerySchema,
  MController,
} from "../../../lib";
import { GptChatCommentService } from "../../../services";
import { GptChatComment } from "../../../models";

import * as hapi from "@hapi/hapi";
import {
  CreateGptChatCommentDto,
  CreateGptChatCommentSchema,
  UpdateGptChatCommentDto,
  UpdateGptChatCommentSchema,
} from "../../../dtos";
import Joi from "joi";

@Service()
@controller("/api/users/{userId}/user_gpt_chat_comments")
export class UserGptChatCommentsController extends MController {
  @Inject(() => GptChatCommentService)
  avPostCommentService!: GptChatCommentService;

  @get("/")
  @options({
    tags: ["api", "GptChatComment"],
    description: "查询GptChatComment列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<GptChatComment>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<GptChatComment>(query);
    return this.avPostCommentService.getGptChatCommentList(listQuery);
  }

  @get("/{id}")
  @options({
    tags: ["api", "GptChatComment详情"],
    description: "查询GptChatComment详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<GptChatComment> {
    return this.avPostCommentService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建GptChatComment",
    notes: "返回GptChatComment数据",
    tags: ["api", "GptChatComment"],
    auth: {
      strategy: "jwt",
      scope: ["user", "user-{params.userId}"],
    },

    validate: {
      payload: CreateGptChatCommentSchema,
    },
  })
  async create(req: hapi.Request): Promise<GptChatComment | undefined> {
    const input = req.payload as CreateGptChatCommentDto;
    const { userId } = req.params;
    return this.avPostCommentService.createGptChatComment(userId as string, {
      ...input,
    });
  }

  @route("delete", "/")
  @options({
    description: "删除GptChatComment",
    notes: "返回GptChatComment数据",
    tags: ["api", "GptChatComment"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.avPostCommentService.deleteGptChatComments(JSON.parse(ids));
  }

  @route("delete", "/{id}")
  @options({
    description: "删除GptChatComment",
    notes: "返回GptChatComment数据",
    tags: ["api", "GptChatComment"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async deleteOne(req: hapi.Request): Promise<GptChatComment> {
    const id = req.params.id as string;
    return this.avPostCommentService.deleteOneGptChatComment(id);
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
      payload: UpdateGptChatCommentSchema,
    },
  })
  async updateGptChatComment(req: hapi.Request) {
    const id = req.params.id;
    return this.avPostCommentService.updateGptChatComment(
      id,
      req.payload as UpdateGptChatCommentDto
    );
  }
}
