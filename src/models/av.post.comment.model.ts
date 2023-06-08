import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { Optional, getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class AvPostComment extends Base {
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
  public avPostId!: string;

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
}

export const AvPostCommentModel = getModelForClass(AvPostComment);
export const AvPostCommentSchema = getSchema(AvPostComment);
