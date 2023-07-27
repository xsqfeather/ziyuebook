import { CreateGptChatDto, UpdateGptChatDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { GptChat, GptChatModel } from "../models";
import { Inject, Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
import { AvCategoryService } from ".";
import { Configuration, OpenAIApi } from "openai";
import { getOpenAIApiKey } from "../lib/config";

const configuration = new Configuration({
  apiKey: getOpenAIApiKey(),
});
const openai = new OpenAIApi(configuration);

@Service()
export class GptChatService extends BaseService<GptChat> {
  @Inject(() => AvCategoryService)
  private readonly avCategoryService!: AvCategoryService;

  public async getGptChatList(
    input: GetListQuery<GptChat>
  ): Promise<ListData<GptChat>> {
    const { data, total } = await this.getListData<GptChat>(
      GptChatModel,
      input,
      ["title", "description", "tagsStr", "categoryNameStr", "starsStr"]
    );
    return {
      data,
      total,
    };
  }

  public async getGptChatByCategory(categoryId: string, filter: any) {
    const data = await GptChatModel.find({
      $and: [
        {
          $or: [{ categoryId }, { "category.superCategoryIds": categoryId }],
        },
        ...filter,
      ],
    });
    const total = await GptChatModel.countDocuments({
      $and: [
        {
          $or: [{ categoryId }, { "category.superCategoryIds": categoryId }],
        },
        ...filter,
      ],
    });
    return {
      data,
      total,
    };
  }

  public async getOne(id: string) {
    return GptChatModel.findOne({ id });
  }

  public async createGptChat(input: CreateGptChatDto): Promise<GptChat> {
    if (!input.deviceId && !input.userId) {
      throw Boom.badRequest("缺少参数, deviceId 或 userId 必须传一个");
    }
    const gptChat = new GptChatModel();
    gptChat.deviceId = input.deviceId;
    gptChat.userId = input.userId;
    gptChat.systemContent = input.systemContent;
    if (input.systemContent) {
      gptChat.messages = [
        { role: "system", content: input.systemContent },
        ...input.messages,
      ];
    } else {
      gptChat.messages = input.messages;
    }
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: gptChat.messages,
    });
    gptChat.messages = [
      ...gptChat.messages,
      chatCompletion.data.choices[0].message,
    ];
    await gptChat.save();
    return gptChat;
  }

  public async deleteGptChats(checkedIds: string[]) {
    await GptChatModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }

  public async patchGptChat(id: string, input: Partial<UpdateGptChatDto>) {
    return GptChatModel.findOneAndUpdate(
      { id },
      {
        $set: {
          ...input,
        },
      }
    );
  }

  async updateGptChat(id: string, input: UpdateGptChatDto) {
    const gptChat = await GptChatModel.findOne({ id });
    if (!gptChat) {
      throw Boom.notFound("该对话不存在");
    }
    gptChat.systemContent = input.systemContent || gptChat.systemContent;
    gptChat.temper = input.temper || gptChat.temper;
    gptChat.messages = input.messages || gptChat.messages;
    gptChat.title = input.title || gptChat.title;
    gptChat.tags = input.tags || gptChat.tags;
    gptChat.isPublic = input.isPublic || gptChat.isPublic;
    gptChat.deviceId = input.deviceId || gptChat.deviceId;

    if (input.systemContent !== gptChat.systemContent) {
      input.messages = [
        { role: "system", content: input.systemContent },
        ...input.messages.filter((item) => item.role !== "system"),
      ];
    }

    if (input.messages[input.messages.length - 1].role === "user") {
      const chatCompletion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: gptChat.messages,
      });
      gptChat.messages = [
        ...input.messages,
        chatCompletion.data.choices[0].message,
      ];
    }

    await gptChat.save();
    return gptChat;
  }

  public async deleteGptChat(id: string) {
    const article = await GptChatModel.findOneAndRemove({ id });
    return article;
  }
}
