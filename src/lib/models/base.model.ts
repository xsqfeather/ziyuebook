import { getModelForClass, prop } from "@typegoose/typegoose";
import { Required, getSchema } from "joi-typescript-validator";
import { nanoid } from "nanoid";

class BaseClass {
  @Required()
  @prop({ required: true, default: () => nanoid(), type: String })
  public id!: string;

  @Required()
  @prop({ required: true, default: () => new Date(), type: Date })
  public createdAt!: Date;

  @Required()
  @prop({ required: true, default: () => new Date(), type: Date })
  public updatedAt!: Date;
}

export const Base = BaseClass;
export const BaseModel = getModelForClass(BaseClass);
export const BaseSchema = getSchema(BaseClass);
