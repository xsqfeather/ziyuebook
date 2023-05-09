import { Optional, Required, getSchema } from "joi-typescript-validator";

export class CreateUserAvPostLikeDto {
  @Required()
  public title!: string;

  @Required()
  public content!: string;

  @Required()
  public cover!: string;

  @Required()
  public description!: string;

  @Optional()
  public tags?: string[];
}

export const CreateUserAvPostLikeSchema = getSchema(
  CreateUserAvPostLikeDto
).label("CreateUserAvPostLikeDto");
