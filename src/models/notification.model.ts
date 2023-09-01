import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { string } from "joi";

@modelOptions({ options: { allowMixed: 0 } })
export class Notification extends Base {
  @prop({
    type: String,
  })
  public fromUserId?: string;

  @prop({
    type: String,
  })
  public content?: string;

  @prop({
    type: Object,
  })
  public title?: {
    [lang: string]: string;
  };

  @prop({
    type: String,
  })
  public toUserId?: string;

  @prop({
    type: String,
  })
  public username?: string;

  @prop({
    type: String,
  })
  public userAvatar?: string;

  @prop({
    type: String,
  })
  public source?: string;

  @prop({
    type: String,
  })
  public sourceId?: string;

  @prop({
    type: Object,
  })
  public sourcePayload?: Object;

  @prop({
    type: Boolean,
    default: false,
  })
  public read: boolean;
}

export const NotificationModel = getModelForClass(Notification);
export const NotificationSchema = getSchema(Notification);
