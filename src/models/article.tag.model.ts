import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
class ArticleTagClass extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public name!: string;

  @prop({
    type: String,
  })
  public image?: string;

  @Required()
  @prop({
    type: Number,
    default: 0,
    required: true,
  })
  public hot!: number;
}

export const ArticleTagModel = getModelForClass(ArticleTagClass);
export const ArticleTagSchema = getSchema(ArticleTagClass);
