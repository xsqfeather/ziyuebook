import { modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({ options: { allowMixed: 0 } })
export class Block {
  @prop({
    type: Number,
  })
  positionX: number;

  @prop({
    type: Number,
  })
  positionY: number;

  @prop({
    type: String,
  })
  ownerId?: string;

  @prop({
    type: Object,
  })
  info: {
    title: string;
    avatar: string;
  };
}
