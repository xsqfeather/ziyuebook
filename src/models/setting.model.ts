import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class Setting extends Base {
  @prop({
    type: String,
    required: true,
    unique: true,
  })
  public key!: string;

  @prop({
    type: String,
    required: true,
  })
  public value!: string;
}
export const SettingModel = getModelForClass(Setting);
