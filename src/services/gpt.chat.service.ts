import { CreateGptChatDto, UpdateGptChatDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { GptChat, GptChatModel, UserModel } from "../models";
import { Inject, Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { getOpenAIApiKey, getOpenAIOrgId } from "../lib/config";
import { AvatarGenerator } from "random-avatar-generator";
import { SubGptMsg } from "../events/SubGptMsg";

const generator = new AvatarGenerator();

const configuration = new Configuration({
  apiKey: getOpenAIApiKey(),
  organization: getOpenAIOrgId(),
});
const openai = new OpenAIApi(configuration);

@Service()
export class GptChatService extends BaseService<GptChat> {
  @Inject(() => SubGptMsg)
  private readonly subGptMsg!: SubGptMsg;

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

  public async createGptChat(
    input: CreateGptChatDto,
    userId?: string
  ): Promise<GptChat> {
    if (!input.deviceId && userId) {
      throw Boom.badRequest("lack-params-deviceId-or-userId-when-create");
    }
    let userCount = 0;
    if (input.deviceId && !userId) {
      userCount = await GptChatModel.countDocuments({
        deviceId: input.deviceId,
      });
      // if (userCount > 5) {
      //   throw Boom.badRequest("unregister-user-limit-exceeded-5");
      // }
    }
    try {
      const gptChat = new GptChatModel();
      gptChat.deviceId = input.deviceId;
      gptChat.systemContent = input.systemContent;
      if (input.systemContent) {
        gptChat.messages = [
          { role: "system", content: input.systemContent },
          ...input.messages,
        ];
      } else {
        gptChat.messages = input.messages;
      }
      if (userId) {
        const user = await UserModel.findOne({ id: userId });
        if (!user) {
          throw Boom.notFound("用户不存在");
        }
        gptChat.userId = userId;
        gptChat.username = user.username;
        gptChat.nickname = user.nickname;
        gptChat.avatar = user.avatar;
      } else {
        gptChat.avatar = generator.generateRandomAvatar();
        gptChat.nickname = "YOU";
      }
      await gptChat.save();
      console.log("开始发起请求");
      this.subGptMsg.trigger(gptChat.id, input.messages);
      return gptChat;
    } catch (error) {
      console.error(error);
      throw Boom.badRequest("对话生成失败");
    }
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
    if (input.isPublic === true && gptChat.isPublic === true) {
      throw Boom.badRequest("该对话已经是公开的了");
    }
    gptChat.systemContent = input.systemContent || gptChat.systemContent;
    gptChat.temper = input.temper || gptChat.temper;
    gptChat.messages = input.messages || gptChat.messages;
    gptChat.title = input.title || gptChat.title;
    gptChat.tags = input.tags || gptChat.tags;
    gptChat.deviceId = input.deviceId || gptChat.deviceId;

    if (input.systemContent !== gptChat.systemContent) {
      input.messages = [
        { role: "system", content: input.systemContent },
        ...input.messages.filter((item) => item.role !== "system"),
      ];
    }

    if (input.messages[input.messages.length - 1].role === "user") {
      const chatCompletion = await openai.createChatCompletion(
        {
          model: "gpt-4",
          messages: gptChat.messages,
        },
        {
          responseType: "stream",
        }
      );
      gptChat.messages = [
        ...input.messages,
        chatCompletion.data.choices[0].message,
      ];
    }

    if (input.isPublic === true && !gptChat.isPublic) {
      //分享到广场得积分1
      await UserModel.findOneAndUpdate(
        { id: gptChat.userId },
        { $inc: { gptCredit: 1 } }
      );
      gptChat.isPublic = input.isPublic;
    }
    if (input.isPublic === false && gptChat.isPublic === true) {
      //取消分享到广场得积分-1
      await UserModel.findOneAndUpdate(
        { id: gptChat.userId },
        { $inc: { gptCredit: -1 } }
      );
      gptChat.isPublic = input.isPublic;
    }

    await gptChat.save();
    return gptChat;
  }

  async getGPTStream(inputMessages: ChatCompletionRequestMessage[]) {
    const chatCompletion = await openai.createChatCompletion(
      {
        model: "gpt-4",
        messages: inputMessages,
        stream: true,
      },
      {
        responseType: "stream",
      }
    );
    return chatCompletion.data as any;
  }

  public async deleteGptChat(id: string) {
    const article = await GptChatModel.findOneAndRemove({ id });
    return article;
  }
}
