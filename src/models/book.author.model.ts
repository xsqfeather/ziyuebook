import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class BookAuthor extends Base {
  @prop({
    type: String,
    required: true,
  })
  name!: string;

  @prop({
    type: String,
  })
  cover?: string;

  @prop({
    type: String,
  })
  description?: string;
}

export const BookAuthorModel = getModelForClass(BookAuthor);
export const BookAuthorSchema = getSchema(BookAuthor);
