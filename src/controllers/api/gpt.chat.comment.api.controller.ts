import { controller, get, options, post, route, put } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { GptChatComment } from "../../models";
import { GptChatCommentService } from "../../services";
import * as hapi from "@hapi/hapi";
import {
  CreateGptChatCommentDto,
  CreateGptChatCommentSchema,
  UpdateGptChatCommentDto,
  UpdateGptChatCommentSchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/gpt_chat_comments")
export class GptChatCommentApiController extends MController {
  @Inject(() => GptChatCommentService)
  gptChatCommentService!: GptChatCommentService;

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
    return this.gptChatCommentService.getGptChatCommentList(listQuery);
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
    return this.gptChatCommentService.getOne(req.params.id as string);
  }

  @post("/")
  @options({
    description: "新建GptChatComment",
    notes: "返回GptChatComment数据",
    tags: ["api", "GptChatComment"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },

    validate: {
      payload: CreateGptChatCommentSchema,
    },
  })
  async create(req: hapi.Request): Promise<GptChatComment | undefined> {
    const input = req.payload as CreateGptChatCommentDto;
    const { userId } = req.auth.credentials;
    return this.gptChatCommentService.createGptChatComment(
      userId as string,
      input
    );
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
    return this.gptChatCommentService.deleteGptChatComments(JSON.parse(ids));
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
    return this.gptChatCommentService.deleteOneGptChatComment(id);
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
    return this.gptChatCommentService.updateGptChatComment(
      id,
      req.payload as UpdateGptChatCommentDto
    );
  }
}
