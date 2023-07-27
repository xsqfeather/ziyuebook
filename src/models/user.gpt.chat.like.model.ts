import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema, Required } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { GptChat } from ".";

@modelOptions({ options: { allowMixed: 0 } })
export class UserGptChatLike extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public gptChatId!: string;

  @Required()
  @prop({
    type: Object,
    required: true,
  })
  public gptChat!: GptChat;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public userId!: string;
}

export const UserGptChatLikeModel = getModelForClass(UserGptChatLike);
export const UserGptChatLikeSchema = getSchema(UserGptChatLike);
