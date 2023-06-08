import { getModelForClass, modelOptions } from "@typegoose/typegoose";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class TraderOrder extends Base {
  buyId!: string;
  buyPrice!: number;
  buyAmount!: number;
  buyTotal!: number;
  buyTime!: Date;
  buyStatus!: string;
  //购买手续费
  buyFee?: number;
  sellId?: string;
  sellPrice?: number;
  sellAmount?: number;
  sellTotal?: number;
  sellTime!: Date;
  sellStatus!: string;
  //卖出手续费
  sellFee!: string;
  symbol!: string;
  // 买入盈利
  profit!: string;
}
export const TraderOrderModel = getModelForClass(TraderOrder);
