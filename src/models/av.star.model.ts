import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { Optional, getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { SchemaTypes } from "mongoose";

@modelOptions({ options: { allowMixed: 0 } })
export class AvStar extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public name!: string;

  @Optional()
  @prop({
    type: String,
    default: false,
  })
  isFemaleFriendly!: boolean;

  @Optional()
  @prop({
    type: SchemaTypes.Array,
  })
  public gallery?: string[];

  @Optional()
  @prop({
    type: String,
    default: "",
  })
  public introduction!: string;

  @Required()
  @prop({
    type: String,
  })
  public description!: string;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public avatar!: string;

  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public hot!: number;

  @prop({
    type: Object,
  })
  langs!: {
    [x: string]: string;
  };
}

export const AvStarModel = getModelForClass(AvStar);
export const AvStarSchema = getSchema(AvStar);
