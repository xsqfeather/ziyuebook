import { Required, getSchema } from "joi-typescript-validator";

export class CreateUserGptChatLikeDto {
  @Required()
  public gptChatId!: string;
}

export const CreateUserGptChatLikeSchema = getSchema(
  CreateUserGptChatLikeDto
).label("CreateUserGptChatLikeDto");

export class UpdateUserGptChatLikeDto {
  @Required()
  public gptChatId!: string;
}

export const UpdateUserGptChatLikeSchema = getSchema(
  UpdateUserGptChatLikeDto
).label("UpdateUserGptChatLikeDto");

export class DeleteUserGptChatLikeDto {
  @Required()
  public gptChatId!: string;
}

export const DeleteUserGptChatLikeSchema = getSchema(
  DeleteUserGptChatLikeDto
).label("DeleteUserGptChatLikeDto");
