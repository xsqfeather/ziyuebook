import Joi from "joi";
import { CustomSchema, Required, getSchema } from "joi-typescript-validator";

export class CreateArticleDto {
  @Required()
  public title!: string;

  @Required()
  public content!: string;

  @CustomSchema(Joi.any().meta({ swaggerType: "file" }).required())
  public cover!: string;
}

export const CreateArticleSchema =
  getSchema(CreateArticleDto).label("CreateArticleDto");
