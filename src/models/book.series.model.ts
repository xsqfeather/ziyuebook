import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class BookSeries extends Base {
  @prop({
    type: String,
    required: true,
  })
  name: string;

  @prop({
    type: String,
  })
  cover?: string;

  @prop({
    type: String,
  })
  description?: string;

  @prop({
    type: String,
  })
  publisher?: string;

  @prop({
    type: String,
  })
  publisherId?: string;
}

export const BookSeriesModel = getModelForClass(BookSeries);
export const BookSeriesSchema = getSchema(BookSeries);
