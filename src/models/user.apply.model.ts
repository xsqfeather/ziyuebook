import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class UserApply extends Base {
  @prop({
    type: String,
  })
  username: string;

  @prop({
    type: String,
  })
  userAvatar: string;

  @prop({
    type: String,
  })
  public fromUserId?: string;

  @prop({
    type: String,
  })
  public toUserId?: string;

  @prop({
    type: String,
  })
  public type?: "friend" | "group";

  @prop({
    type: String,
    default: "pending",
  })
  public status?: "pending" | "accepted" | "rejected";

  @prop({
    type: String,
  })
  public groupId?: string;

  @prop({
    type: Boolean,
    default: false,
  })
  public read: boolean;

  @prop({
    type: String,
  })
  public applyNote: string; // 申请备注
}

export const UserApplyModel = getModelForClass(UserApply);
export const UserApplySchema = getSchema(UserApply);
