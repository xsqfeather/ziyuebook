import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema, Required } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { SchemaTypes } from "mongoose";

@modelOptions({ options: { allowMixed: 0 } })
export class UserAvPostLike extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public title!: string;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public content!: string;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public cover!: string;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public description!: string;

  @Required()
  @prop({
    type: SchemaTypes.Array,
    required: true,
  })
  public tags!: string[];

  @Required()
  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public hot!: number;
}

export const UserAvPostLikeModel = getModelForClass(UserAvPostLike);
export const UserAvPostLikeSchema = getSchema(UserAvPostLike);
