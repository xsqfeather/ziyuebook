import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class Article extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public title!: string;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public content!: string;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  public cover!: string;

  @prop({
    type: String,
  })
  public originUrl?: string;

  @prop({
    type: String,
  })
  public publishTime?: string;

  @prop({
    type: Object,
  })
  public provider?: {
    name: string;
    href: string;
    logo: string;
  };

  @Required()
  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public hot!: number;

  @prop({
    type: Boolean,
    default: false,
  })
  public washed!: boolean;
}

export const ArticleModel = getModelForClass(Article);
export const ArticleSchema = getSchema(Article);
