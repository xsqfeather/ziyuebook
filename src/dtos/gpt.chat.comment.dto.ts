import Joi from "joi";
import {
  CustomSchema,
  MaxLength,
  MinLength,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";

export class CreateGptChatCommentDto {
  @Required()
  public gptChatIdId!: string;

  @CustomSchema(Joi.string().min(1).required())
  public comment!: string;

  @Optional()
  public referUserId!: string;

  @Optional()
  public referCommentId!: string;
}

export const CreateGptChatCommentSchema = getSchema(
  CreateGptChatCommentDto
).label("CreateGptChatCommentDto");

export class UpdateGptChatCommentDto {
  @Required()
  public userId!: string;

  @Required()
  public gptChatIdId!: string;

  @Required()
  @MinLength(15)
  public comment!: string;

  @Optional()
  public referUserId!: string;

  @Optional()
  @MaxLength(100)
  public referComment!: string;
}

export const UpdateGptChatCommentSchema = getSchema(
  UpdateGptChatCommentDto
).label("UpdateGptChatCommentDto");
