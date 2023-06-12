import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema, Required } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class UserMessage extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public content!: string;

  @Required()
  @prop({
    type: Object,
    required: true,
  })
  public sourceObj!: any;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public resource!: string;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public resourceId!: string;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public status!: "read" | "unread";
}

export const UserMessageModel = getModelForClass(UserMessage);
export const UserMessageSchema = getSchema(UserMessage);
