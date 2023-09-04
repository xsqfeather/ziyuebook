import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { Schema } from "mongoose";

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
    type: Object,
  })
  public imagePosition?: {
    [x: number]: {
      imageSrc: string;
      imageAlt: string;
      imageTitle: string;
    };
  };

  @prop({
    type: String,
  })
  public twitterPost?: string;

  @prop({
    type: Schema.Types.Array,
  })
  public tags?: string[];

  @prop({
    type: String,
  })
  public tagsStr?: string;

  @prop({
    type: Schema.Types.Date,
  })
  public publishTime?: Date;

  @prop({
    type: String,
    default: "en",
  })
  public locale!: "zh" | "en" | "zhTW";

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

  @prop({
    type: Number,
    default: 0,
  })
  public status!: number;
}

export const ArticleModel = getModelForClass(Article);
export const ArticleSchema = getSchema(Article);
