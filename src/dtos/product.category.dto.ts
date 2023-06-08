import Joi from "joi";
import {
  CustomSchema,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";

export class CreateProductCategoryDto {
  @Required()
  public name!: string;

  @Optional()
  public cover!: string;

  @Optional()
  public description!: string;

  @Optional()
  public locale: string = "zh";

  @CustomSchema(
    Joi.object({
      zh: Joi.string().optional().allow(""),
      en: Joi.string().optional().allow(""),
      "zh-TW": Joi.string().optional().allow(""),
    }).optional()
  )
  public langs!: {
    zh: string;
    en: string;
    "zh-TW": string;
  };
}

export const CreateProductCategorySchema = getSchema(
  CreateProductCategoryDto
).label("CreateProductCategoryDto");

export class UpdateProductCategoryDto {
  @Optional()
  public name!: string;

  @Optional()
  public superCategoryId!: string;

  @Optional()
  public cover!: string;

  @Optional()
  public description!: string;

  @Optional()
  public locale: string = "zh";

  @CustomSchema(
    Joi.object({
      zh: Joi.string().optional().allow(""),
      en: Joi.string().optional().allow(""),
      "zh-TW": Joi.string().optional().allow(""),
    }).optional()
  )
  public langs!: {
    zh: string;
    en: string;
    "zh-TW": string;
  };
}

export const UpdateProductCategorySchema = getSchema(
  UpdateProductCategoryDto
).label("UpdateProductCategoryDto");
