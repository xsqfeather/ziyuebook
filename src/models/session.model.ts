import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { SchemaTypes } from "mongoose";

@modelOptions({ options: { allowMixed: 0 } })
export class Session extends Base {
  @prop({
    type: String,
    required: true,
  })
  public userId!: string;

  @prop({
    type: Date,
    required: true,
  })
  public expiresAt!: Date;

  @prop({
    type: SchemaTypes.Array,
    required: true,
  })
  public roles!: string[];
}

export const SessionModel = getModelForClass(Session);

export const SessionSchema = getSchema(Session);
