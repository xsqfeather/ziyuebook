import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { Optional, getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class GptChatComment extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public userId!: string;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public gptChatId!: string;

  @Required()
  @prop({
    type: String,
    required: true,
    minlength: 1,
  })
  public comment!: string;

  @Optional()
  @prop({
    type: String,
  })
  public referCommentId!: string;

  @Required()
  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public replyCount!: number;

  @Optional()
  @prop({
    type: String,
  })
  public referUserId!: string;
}

export const GptChatCommentModel = getModelForClass(GptChatComment);
export const GptChatCommentSchema = getSchema(GptChatComment);
