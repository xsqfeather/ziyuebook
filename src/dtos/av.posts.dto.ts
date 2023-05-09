import { Optional, Required, getSchema } from "joi-typescript-validator";

export class CreateAvPostDto {
  @Required()
  public title!: string;

  @Required()
  public content!: string;

  @Required()
  public cover!: string;

  @Required()
  public description!: string;

  @Optional()
  public tags?: { name: string }[];
}

export const CreateAvPostSchema =
  getSchema(CreateAvPostDto).label("CreateAvPostDto");
