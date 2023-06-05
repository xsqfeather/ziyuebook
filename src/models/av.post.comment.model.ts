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
    minlength: 15,
  })
  public comment!: string;

  @Optional()
  @prop({
    type: String,
  })
  public referUserId: string;

  @Optional()
  @prop({
    type: String,
    maxlength: 80,
  })
  public referComment?: string;
}

export const AvPostCommentModel = getModelForClass(AvPostComment);
export const AvPostCommentSchema = getSchema(AvPostComment);
