import Joi from "joi";
import {
  CustomSchema,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";

export class CreateChatMsgDto {
  @Required()
  public msg!: string;

  @Required()
  public userId!: string;

  @Required()
  public username!: string;

  @Required()
  public avatar: string;

  @Optional()
  public nickname?: string;
}

export const CreateChatMsgSchema =
  getSchema(CreateChatMsgDto).label("CreateChatMsgDto");

export class UpdateChatMsgDto {
  @Optional()
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

export const UpdateChatMsgSchema =
  getSchema(UpdateChatMsgDto).label("UpdateChatMsgDto");
