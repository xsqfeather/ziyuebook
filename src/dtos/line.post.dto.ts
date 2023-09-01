import Joi from "joi";
import {
  CustomSchema,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";

export class CreateLinePostDto {
  @Optional()
  isFemaleFriendly?: boolean;

  @CustomSchema(Joi.string().allow(null, "").optional())
  introduction!: string;

  @Required()
  public name!: string;

  @Required()
  public avatar!: {
    name: string;
    origin: string;
  };

  @Optional()
  public description?: string;

  @Optional()
  public gallery?: { name: string; origin: string }[] = [];

  @Optional()
  public tags?: string[];

  @Optional()
  public hot?: number;

  @Optional()
  public bustSize?: number;

  @Optional()
  public locale?: string;

  @CustomSchema(
    Joi.object({
      zh: Joi.string().optional().allow(""),
      en: Joi.string().optional().allow(""),
      zhTW: Joi.string().optional().allow(""),
    })
      .optional()
      .allow(null)
  )
  public langs?: {
    zh: string;
    en: string;
    zhTW: string;
  };
}

export const CreateLinePostSchema =
  getSchema(CreateLinePostDto).label("CreateLinePostDto");

export class UpdateLinePostDto {
  @CustomSchema(Joi.string().optional().allow("", null))
  introduction?: string;

  @Optional()
  isFemaleFriendly?: boolean;

  @Required()
  public name!: string;

  @Required()
  public avatar!: {
    name: string;
    origin: string;
  };

  @Optional()
  public description?: string;

  @Optional()
  public gallery?: { origin: string; name: string }[];

  @Optional()
  public tags?: string[];

  @Optional()
  public hot?: number;

  @Optional()
  public bustSize?: number;

  @Optional()
  public locale?: string;

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

export const UpdateLinePostSchema =
  getSchema(UpdateLinePostDto).label("UpdateLinePostDto");
