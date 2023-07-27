import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { Optional, getSchema } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { SchemaTypes } from "mongoose";
import { ChatCompletionRequestMessage } from "openai";

@modelOptions({ options: { allowMixed: 0 } })
export class GptChat extends Base {
  @Optional()
  @prop({
    type: String,
  })
  public systemContent?: string;

  @Optional()
  @prop({
    type: Number,
  })
  public temper?: number;

  @prop({
    type: SchemaTypes.Array,
  })
  public messages!: ChatCompletionRequestMessage[];

  @prop({
    type: String,
  })
  public username!: string;

  @prop({
    type: String,
  })
  public avatar!: string;

  @prop({
    type: String,
  })
  public nickname!: string;

  @prop({
    type: String,
  })
  public userId!: string;

  @prop({
    type: String,
  })
  public deviceId!: string;

  @prop({
    type: String,
  })
  public tags!: string;

  @prop({
    type: String,
  })
  public title!: string;

  @prop({
    type: Boolean,
    default: false,
  })
  public isPublic!: Boolean;
}

export const GptChatModel = getModelForClass(GptChat);
export const GptChatSchema = getSchema(GptChat);
