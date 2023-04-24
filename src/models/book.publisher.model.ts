import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class BookPublisher extends Base {
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
}

export const BookPublisherModel = getModelForClass(BookPublisher);
export const BookPublisherSchema = getSchema(BookPublisher);
