import Joi from "joi";
import {
  CustomSchema,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";

export class CreateAvStarDto {
  @Required()
  public name!: string;

  @Required()
  public avatar!: string;

  @Optional()
  public introduction?: string;

  @Optional()
  public description?: string;

  @Optional()
  public gallery?: string[] = [];

  @Optional()
  public tags?: string[];

  @Optional()
  public hot?: number;

  @Optional()
  public bustSize?: number;

  @Optional()
  public locale?: number;

  @CustomSchema(
    Joi.object({
      zh: Joi.string().optional().allow(""),
      en: Joi.string().optional().allow(""),
      "zh-TW": Joi.string().optional().allow(""),
    }).optional()
  )
  public langs: {
    zh: string;
    en: string;
    "zh-TW": string;
  };
}

export const CreateAvStarSchema =
  getSchema(CreateAvStarDto).label("CreateAvStarDto");

export class UpdateAvStarDto {
  @Required()
  public name!: string;

  @Required()
  public avatar!: string;

  @Optional()
  public introduction?: string;

  @Optional()
  public description?: string;

  @Optional()
  public gallery?: string[] = [];

  @Optional()
  public tags?: string[];

  @Optional()
  public hot?: number;

  @Optional()
  public bustSize?: number;

  @Optional()
  public locale?: number;

  @CustomSchema(
    Joi.object({
      zh: Joi.string().optional().allow(""),
      en: Joi.string().optional().allow(""),
      "zh-TW": Joi.string().optional().allow(""),
    }).optional()
  )
  public langs: {
    zh: string;
    en: string;
    "zh-TW": string;
  };
}

export const UpdateAvStarSchema =
  getSchema(UpdateAvStarDto).label("UpdateAvStarDto");
