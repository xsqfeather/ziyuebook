import { optional } from "joi";
import { Optional, Required, getSchema } from "joi-typescript-validator";

export class CreateAvActorDto {
  @Required()
  public jp_name!: string;

  @Required()
  public en_name!: string;

  @Optional()
  public alias?: string[];

  @Required()
  public introduction!: string;

  @Required()
  public avatar!: string;

  @Required()
  public gallery?: string[];

  @Optional()
  public tags?: string[];

  @Optional()
  public hot?: number;

  @Optional()
  public bustSize?: number;
}

export const CreateAvActorSchema =
  getSchema(CreateAvActorDto).label("CreateAvActorDto");
