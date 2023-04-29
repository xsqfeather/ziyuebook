import { getModelForClass } from "@typegoose/typegoose";
import { Base } from "../lib/models";

export class Trader extends Base {
  initAmount: number;
  currentAmount: number;
  lastLose: number;
  lastWin: number;
  loseRate: number;
  winRate: number;
  currentOrderId: string;
  currentOrderStatus: string;
  currentOrderWin: number;
  currentLosePrice: number;
  currentWinPrice: number;
}
export const TraderModel = getModelForClass(Trader);
