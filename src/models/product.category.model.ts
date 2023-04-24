import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class ProductCategory extends Base {
  @prop({
    type: String,
    required: true,
  })
  name: string;

  @prop({
    type: String,
  })
  cover?: string;

  @prop({
    type: String,
  })
  description?: string;

  @prop({
    type: String,
  })
  superCategoryName?: string;

  @prop({
    type: String,
  })
  superCategoryId?: string;
}

export const ProductCategoryModel = getModelForClass(ProductCategory);
export const ProductCategorySchema = getSchema(ProductCategory);
