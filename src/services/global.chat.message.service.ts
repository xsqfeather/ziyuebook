import {
  CreateGlobalChatMessageDto,
  UpdateGlobalChatMessageDto,
} from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { GlobalChatMessage, GlobalChatMessageModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
import { globalEmitter } from "../lib/utils/globalEmitter";

@Service()
export class GlobalChatMessageService extends BaseService<GlobalChatMessage> {
  public async getGlobalChatMessageList(
    input: GetListQuery<GlobalChatMessage>
  ): Promise<ListData<GlobalChatMessage>> {
    const { data, total } = await this.getListData<GlobalChatMessage>(
      GlobalChatMessageModel,
      input,
      ["msg", "nickname"]
    );
    return {
      data,
      total,
    };
  }

  public async getOne(id: string) {
    const avTag = await GlobalChatMessageModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    return avTag;
  }

  public async deleteGlobalChatMessages(checkedIds: string[]) {
    await GlobalChatMessageModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }

  public async deleteOneGlobalChatMessage(id: string) {
    const avTag = await GlobalChatMessageModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该标签不存在");
    }
    await avTag.remove();
    return avTag;
  }

  public async createGlobalChatMessage(
    input: CreateGlobalChatMessageDto
  ): Promise<GlobalChatMessage | undefined> {
    try {
      const GlobalChatMessage = await GlobalChatMessageModel.create({
        ...input,
      });
      globalEmitter.emit("message", {
        room: "/global-chat",
        message: {
          hasNew: true,
        },
      });
      return GlobalChatMessage;
    } catch (error) {
      console.error(error);
      throw Boom.internal(error);
    }
  }

  async updateGlobalChatMessage(id: string, input: UpdateGlobalChatMessageDto) {
    try {
      const avTag = await GlobalChatMessageModel.findOne({ id });
      if (!avTag) {
        throw Boom.notFound("该标签不存在");
      }
      const updatedGlobalChatMessage =
        await GlobalChatMessageModel.findOneAndUpdate(
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

      return updatedGlobalChatMessage;
    } catch (error) {
      console.error(error);
    }
  }
}
