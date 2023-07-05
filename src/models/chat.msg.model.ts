import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class ChatMsg extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public msg!: string;

  @prop({
    type: String,
  })
  public avatar!: string;

  @prop({
    type: String,
  })
  public username!: string;

  @prop({
    type: String,
  })
  public nickname!: string;

  @prop({
    type: String,
  })
  public userId!: string;
}

export const ChatMsgModel = getModelForClass(ChatMsg);
export const ChatMsgSchema = getSchema(ChatMsg);
