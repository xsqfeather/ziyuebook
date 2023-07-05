import { CreateChatMsgDto, UpdateChatMsgDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { ChatMsg, ChatMsgModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
import { globalEmitter } from "../lib/utils/globalEmitter";

@Service()
export class ChatMsgService extends BaseService<ChatMsg> {
  public async getChatMsgList(
    input: GetListQuery<ChatMsg>
  ): Promise<ListData<ChatMsg>> {
    const { data, total } = await this.getListData<ChatMsg>(
      ChatMsgModel,
      input,
      ["name", "description"]
    );
    return {
      data,
      total,
    };
  }

  public async getOne(id: string) {
    const avTag = await ChatMsgModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    return avTag;
  }

  public async deleteChatMsgs(checkedIds: string[]) {
    await ChatMsgModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }

  public async deleteOneChatMsg(id: string) {
    const avTag = await ChatMsgModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    await avTag.remove();
    return avTag;
  }

  public async createChatMsg(
    input: CreateChatMsgDto
  ): Promise<ChatMsg | undefined> {
    try {
      const ChatMsg = await ChatMsgModel.create({
        ...input,
      });
      globalEmitter.emit("new-message", 1);
      return ChatMsg;
    } catch (error) {
      console.error(error);
      throw Boom.internal(error);
    }
  }

  async updateChatMsg(id: string, input: UpdateChatMsgDto) {
    try {
      const avTag = await ChatMsgModel.findOne({ id });
      if (!avTag) {
        throw Boom.notFound("该标签不存在");
      }
      const updatedChatMsg = await ChatMsgModel.findOneAndUpdate(
        { id },
        {
          ...input,
          langs:
            (input.locale && (!input.langs as any)[input.locale]) ||
            (input.langs as any)[input.locale] === ""
              ? {
                  ...input.langs,
                  [input.locale]: input.name,
                }
              : input.langs,
        }
      );

      return updatedChatMsg;
    } catch (error) {
      console.error(error);
    }
  }
}
