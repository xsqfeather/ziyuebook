import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { SchemaTypes } from "mongoose";

class AvCategoryLangs {
  [locale: string]: string;
}

@modelOptions({ options: { allowMixed: 0 } })
export class AvCategory extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public name!: string;

  @prop({
    type: Object,
  })
  langs!: AvCategoryLangs;

  @prop({
    type: Object,
  })
  descriptionLangs!: AvCategoryLangs;

  @prop({
    type: String,
  })
  public description!: string;

  @prop({
    type: Object,
  })
  public cover!: {
    name: string;
    origin: string;
  };

  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public hot!: number;

  @prop({
    type: SchemaTypes.Array,
    default: [],
  })
  public superCategories!: string[];

  @prop({
    type: SchemaTypes.Array,
    default: [],
  })
  public superCategoryIds!: string[];

  @prop({
    type: String,
  })
  public superCategoryId!: string;

  @prop({
    type: String,
  })
  public superCategory!: string;

  @prop({
    type: String,
  })
  public superCategoriesStr!: string;

  @prop({
    type: Object,
  })
  public superCategoriesLangs!: {
    [locale: string]: string[];
  };

  @prop({
    type: SchemaTypes.Array,
    default: [],
  })
  public subCategories!: string[];

  @prop({
    type: Object,
    default: [],
  })
  public subCategoriesLangs!: {
    [locale: string]: string[];
  };

  @prop({
    type: SchemaTypes.Array,
    default: [],
  })
  public subCategoryIds!: string[];

  @prop({
    type: String,
  })
  public subCategoriesStr!: string;

  @prop({
    type: Object,
  })
  public subCategoriesStrLangs!: {
    [locale: string]: string;
  };

  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public level!: number;

  @prop({
    type: Boolean,
    default: false,
  })
  public isDefault: boolean = false;
}

export const AvCategoryModel = getModelForClass(AvCategory);
export const AvCategorySchema = getSchema(AvCategory);
