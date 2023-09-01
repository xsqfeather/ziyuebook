import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Required } from "joi-typescript-validator";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class LinePost extends Base {
  @Required()
  @prop({
    type: String,
    required: true,
  })
  public content!: string;

  @Required()
  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public view!: number;

  @Required()
  @prop({
    type: Number,
    required: true,
    default: 0,
  })
  public liked!: number;

  @prop({
    type: String,
  })
  public referLinePostId?: string;
}

export const LinePostModel = getModelForClass(LinePost);
export const LinePostSchema = getSchema(LinePost);
