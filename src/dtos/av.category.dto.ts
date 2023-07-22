import Joi from "joi";
import {
  CustomSchema,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";

export class CreateAvCategoryDto {
  @Required()
  public name!: string;

  @Optional()
  public cover!: {
    name: string;
    origin: string;
  };

  @Optional()
  public description!: string;

  @Optional()
  public locale: string = "zh";

  @CustomSchema(
    Joi.object({
      zh: Joi.string().optional().allow(""),
      en: Joi.string().optional().allow(""),
      zhTW: Joi.string().optional().allow(""),
      "zh-Hk": Joi.string().optional().allow(""),
      "zh-HK": Joi.string().optional().allow(""),
    }).optional()
  )
  public langs!: {
    zh: string;
    en: string;
    zhTW: string;
    "zh-Hk": string;
    "zh-HK": string;
  };
}

export const CreateAvCategorySchema = getSchema(CreateAvCategoryDto).label(
  "CreateAvCategoryDto"
);

export class UpdateAvCategoryDto {
  @Optional()
  public name!: string;

  @Optional()
  public superCategoryId!: string;

  @Optional()
  public cover!: {
    name: string;
    origin: string;
  };

  @Optional()
  public description!: string;

  @Optional()
  public locale: string = "zh";

  @CustomSchema(
    Joi.object({
      zh: Joi.string().optional().allow(""),
      en: Joi.string().optional().allow(""),
      zhTW: Joi.string().optional().allow(""),
      "zh-Hk": Joi.string().optional().allow(""),
      "zh-HK": Joi.string().optional().allow(""),
    }).optional()
  )
  public langs!: {
    zh: string;
    en: string;
    zhTW: string;
    "zh-Hk": string;
    "zh-HK": string;
  };
}

export const UpdateAvCategorySchema = getSchema(UpdateAvCategoryDto).label(
  "UpdateAvCategoryDto"
);
