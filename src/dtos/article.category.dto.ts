import Joi from "joi";
import {
  CustomSchema,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";

export class CreateArticleCategoryDto {
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
      zhTW: Joi.string().optional().allow(""),
    }).optional()
  )
  public langs?: {
    zh: string;
    en: string;
    zhTW: string;
  };
}

export const CreateArticleCategorySchema = getSchema(
  CreateArticleCategoryDto
).label("CreateArticleCategoryDto");

export class UpdateArticleCategoryDto {
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
      zhTW: Joi.string().optional().allow(""),
    }).optional()
  )
  public langs?: {
    zh: string;
    en: string;
    zhTW: string;
  };
}

export const UpdateArticleCategorySchema = getSchema(
  UpdateArticleCategoryDto
).label("UpdateArticleCategoryDto");
