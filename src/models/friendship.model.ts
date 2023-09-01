import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { SchemaTypes } from "mongoose";

@modelOptions({ options: { allowMixed: 0 } })
export class Friendship extends Base {
  @Required()
  @prop({
    type: SchemaTypes.Array,
    required: true,
  })
  friendIds: [string, string];
}

export const FriendshipModel = getModelForClass(Friendship);
export const FriendshipSchema = getSchema(Friendship);
