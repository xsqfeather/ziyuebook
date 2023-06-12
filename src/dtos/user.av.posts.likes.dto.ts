import { Required, getSchema } from "joi-typescript-validator";

export class CreateUserAvPostLikeDto {
  @Required()
  public avPostId!: string;
}

export const CreateUserAvPostLikeSchema = getSchema(
  CreateUserAvPostLikeDto
).label("CreateUserAvPostLikeDto");

export class UpdateUserAvPostLikeDto {
  @Required()
  public avPostId!: string;
}

export const UpdateUserAvPostLikeSchema = getSchema(
  UpdateUserAvPostLikeDto
).label("UpdateUserAvPostLikeDto");

export class DeleteUserAvPostLikeDto {
  @Required()
  public avPostId!: string;
}

export const DeleteUserAvPostLikeSchema = getSchema(
  DeleteUserAvPostLikeDto
).label("DeleteUserAvPostLikeDto");
