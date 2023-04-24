import { Required, getSchema } from "joi-typescript-validator";

export class CreateSessionDto {
  @Required()
  public username!: string;

  @Required()
  public password!: string;
}

export const CreateSessionSchema = getSchema(CreateSessionDto);
