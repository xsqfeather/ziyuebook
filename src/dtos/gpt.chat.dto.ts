import {
  Nullable,
  Optional,
  Required,
  getSchema,
} from "joi-typescript-validator";
import { ChatCompletionRequestMessage } from "openai";

export class CreateGptChatDto {
  @Optional()
  public systemContent?: string;

  @Optional()
  public temper?: number;

  @Required()
  public messages: ChatCompletionRequestMessage[];

  @Optional()
  public userId?: string;

  @Optional()
  public deviceId?: string;

  @Optional()
  public tags!: string;

  @Optional()
  public title!: string;
}

export const CreateGptChatSchema =
  getSchema(CreateGptChatDto).label("CreateGptChatDto");

export class UpdateGptChatDto {
  @Optional()
  public systemContent?: string;

  @Optional()
  public temper?: number;

  @Required()
  public messages: ChatCompletionRequestMessage[];

  @Optional()
  public tags!: string;

  @Optional()
  public title!: string;

  @Nullable()
  public isPublic!: boolean;

  @Optional()
  public deviceId?: string;
}

export const UpdateGptChatDtoSchema =
  getSchema(UpdateGptChatDto).label("UpdateGptChatDto");
