import Joi from "joi";
import {
  CustomSchema,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";

export class CreateFriendshipDto {
  @Required()
  friendIds: [string, string];
}

export const CreateFriendshipSchema = getSchema(CreateFriendshipDto).label(
  "CreateFriendshipDto"
);

export class UpdateFriendshipDto {
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

export const UpdateFriendshipSchema = getSchema(UpdateFriendshipDto).label(
  "UpdateFriendshipDto"
);
