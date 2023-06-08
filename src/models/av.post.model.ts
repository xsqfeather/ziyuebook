import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
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
    type: String,
    required: true,
  })
  public cover!: string;

  @prop({
    type: String,
  })
  public categoryId!: string;

  @prop({
    type: SchemaTypes.Array,
  })
  public images!: string[];

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
    type: String,
  })
  public previewVideo!: string;

  @prop({
    type: String,
  })
  public videoName!: string;

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
}

export const AvPostModel = getModelForClass(AvPost);
export const AvPostSchema = getSchema(AvPost);
