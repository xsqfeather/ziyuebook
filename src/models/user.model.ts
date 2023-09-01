import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { SchemaTypes } from "mongoose";

@modelOptions({ options: { allowMixed: 0 } })
export class User extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public username!: string;

  @prop({
    type: Boolean,
    default: false,
  })
  public isRobot!: boolean;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public password?: string;

  @Required()
  @prop({
    type: String,
  })
  public email!: string;

  @Required()
  @prop({
    type: String,
  })
  public nickname!: string;

  @Required()
  @prop({
    type: SchemaTypes.Array,
    required: true,
  })
  public roles!: string[];

  @prop({
    type: String,
  })
  public avatar!: string;

  @prop({
    type: Object,
  })
  settings: any;

  @prop({
    type: Number,
    default: 5,
  })
  public gptCredit!: number;
  //评价或者发帖都可以增加积分，积分可以兑换成gpt credit，被点赞也可以增加积分
}

export const UserModel = getModelForClass(User);
export const UserSchema = getSchema(User).label("User");
