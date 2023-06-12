import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema, Required } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { AvPost } from ".";

@modelOptions({ options: { allowMixed: 0 } })
export class UserAvPostLike extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public avPostId!: string;

  @Required()
  @prop({
    type: Object,
    required: true,
  })
  public avPost!: AvPost;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public userId!: string;
}

export const UserAvPostLikeModel = getModelForClass(UserAvPostLike);
export const UserAvPostLikeSchema = getSchema(UserAvPostLike);
