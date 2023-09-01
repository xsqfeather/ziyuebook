import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class TwitterPostTask extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  queryWord: string;

  @Required()
  @prop({
    type: String,
    required: true,
  })
  post: string;

  @prop({
    type: Number,
    default: 0,
  })
  posted: number;
}

export const TwitterPostTaskModel = getModelForClass(TwitterPostTask);
export const TwitterPostTaskSchema = getSchema(TwitterPostTask);
