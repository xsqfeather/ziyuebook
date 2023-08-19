import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { Optional, getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { SchemaTypes } from "mongoose";
import { AvCategory } from ".";

@modelOptions({ options: { allowMixed: 0 } })
export class AvPost extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public title!: string;

  @prop({
    type: String,
  })
  public subCategoriesStr!: string;

  @prop({
    type: String,
  })
  public locale!: string;

  @prop({
    type: String,
  })
  public categoryNameStr!: string;

  @Required()
  @prop({
    type: Object,
    required: true,
  })
  public cover!: {
    name?: string;
    origin?: string;
    cdn?: string;
  };

  @prop({
    type: String,
  })
  public categoryId!: string;

  @prop({
    type: SchemaTypes.Array,
  })
  public images!: {
    name: string;
    origin: string;
  }[];

  @prop({
    type: String,
  })
  public designator?: string;

  @prop({
    type: Date,
  })
  public publishDate!: Date;

  @prop({
    type: Object,
  })
  public category!: AvCategory;

  @prop({
    type: String,
  })
  public description?: string;

  @prop({
    type: String,
  })
  public introduction?: string;

  @prop({
    type: SchemaTypes.Array,
  })
  public tags!: string[];

  @prop({
    type: SchemaTypes.Array,
  })
  public tagIds!: string[];

  @prop({
    type: SchemaTypes.Array,
  })
  public stars!: string[];

  @prop({
    type: SchemaTypes.Array,
  })
  public starIds!: string[];

  @prop({
    type: Object,
  })
  public video: {
    name: string;
    origin: string;
  };

  @prop({
    type: SchemaTypes.Array,
  })
  public otherVideoUrls!: string[];

  @prop({
    type: String,
  })
  public tagsStr!: string;

  @prop({
    type: String,
  })
  public abyssCode?: string;

  @prop({
    type: String,
  })
  public starsStr!: string;

  @Required()
  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public hot!: number;

  @Required()
  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public commentsCount!: number;

  @Required()
  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public likeCount!: number;

  @Optional()
  @prop({
    type: Number,
    required: true,
    default: false,
  })
  public isFemaleFriendly?: boolean;
}

export const AvPostModel = getModelForClass(AvPost);
export const AvPostSchema = getSchema(AvPost);
