import Joi from "joi";
import {
  CustomSchema,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";

export class CreateAvTagDto {
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
      "zh-TW": Joi.string().optional().allow(""),
    }).optional()
  )
  public langs?: {
    zh: string;
    en: string;
    "zh-TW": string;
  };
}

export const CreateAvTagSchema =
  getSchema(CreateAvTagDto).label("CreateAvTagDto");

export class UpdateAvTagDto {
  @Optional()
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
      "zh-TW": Joi.string().optional().allow(""),
    }).optional()
  )
  public langs!: {
    zh: string;
    en: string;
    "zh-TW": string;
  };
}

export const UpdateAvTagSchema =
  getSchema(UpdateAvTagDto).label("UpdateAvTagDto");
