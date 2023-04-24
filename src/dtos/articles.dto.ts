import { Required, getSchema } from "joi-typescript-validator";

export class CreateArticleDto {
  @Required()
  public title!: string;

  @Required()
  public content!: string;
}

export const CreateArticleSchema = getSchema(CreateArticleDto);
