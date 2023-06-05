import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { SchemaTypes } from "mongoose";

@modelOptions({ options: { allowMixed: 0 } })
export class AvTag extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public name!: string;

  @prop({
    type: Object,
  })
  langs: {
    [locale: string]: string;
  };

  @prop({
    type: String,
  })
  public cover!: string;

  @prop({
    type: String,
  })
  public description!: string;

  @prop({
    type: SchemaTypes.Array,
    default: [],
  })
  public tags: string[] = [];

  @Required()
  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public hot!: number;
}

export const AvTagModel = getModelForClass(AvTag);
export const AvTagSchema = getSchema(AvTag);
