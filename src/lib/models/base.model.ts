import { getModelForClass, prop } from "@typegoose/typegoose";
import { Required, getSchema } from "joi-typescript-validator";
const { nanoid } = require("nanoid");

class BaseClass {
  @Required()
  @prop({ required: true, default: () => nanoid(), type: String })
  public id!: string;

  @Required()
  @prop({ required: true, default: () => Date.now(), type: Date })
  public createdAt!: Date;

  @Required()
  @prop({ required: true, default: () => Date.now(), type: Date })
  public updatedAt!: Date;
}

export const Base = BaseClass;
export const BaseModel = getModelForClass(BaseClass);
export const BaseSchema = getSchema(BaseClass);
