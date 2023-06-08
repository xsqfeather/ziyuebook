import Joi from "joi";
import {
  CustomSchema,
  MaxLength,
  MinLength,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";

export class CreateAvPostCommentDto {
  @Required()
  public avPostId!: string;

  @CustomSchema(Joi.string().min(1).required())
  public comment!: string;

  @Optional()
  public referUserId!: string;

  @Optional()
  public referCommentId!: string;
}

export const CreateAvPostCommentSchema = getSchema(
  CreateAvPostCommentDto
).label("CreateAvPostCommentDto");

export class UpdateAvPostCommentDto {
  @Required()
  public userId!: string;

  @Required()
  public avPostId!: string;

  @Required()
  @MinLength(15)
  public comment!: string;

  @Optional()
  public referUserId!: string;

  @Optional()
  @MaxLength(100)
  public referComment!: string;
}

export const UpdateAvPostCommentSchema = getSchema(
  UpdateAvPostCommentDto
).label("UpdateAvPostCommentDto");
