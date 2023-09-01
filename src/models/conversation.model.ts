import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class Conversation extends Base {
  @prop({
    type: String,
  })
  public title!: string;

  @prop({
    type: String,
  })
  public lastMsg!: string;

  @prop({
    type: String,
  })
  public avatar!: string;

  @prop({
    type: Boolean,
    default: false,
  })
  public mute!: boolean;

  @prop({
    type: Number,
    default: 0,
  })
  public unread!: number;
}

export const ConversationModel = getModelForClass(Conversation);
export const ConversationSchema = getSchema(Conversation);
