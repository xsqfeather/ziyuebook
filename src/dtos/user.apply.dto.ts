import Joi from "joi";
import {
  CustomSchema,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";

export class CreateUserApplyDto {
  @Required()
  fromUserId: string;

  @Required()
  toUserId!: string;

  @Optional()
  applyNote?: string;
}

export const CreateUserApplySchema =
  getSchema(CreateUserApplyDto).label("CreateUserApplyDto");

export class UpdateUserApplyDto {
  @Optional()
  status: "pending" | "accepted" | "rejected";

  @Optional()
  read: boolean;
}

export const UpdateUserApplySchema =
  getSchema(UpdateUserApplyDto).label("UpdateUserApplyDto");
