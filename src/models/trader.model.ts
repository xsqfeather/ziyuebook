import { getModelForClass, modelOptions } from "@typegoose/typegoose";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
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

  //上次买入的价格
  lastBuyPrice: number;

  // 获取价格的次数
  priceGainTimes: number;

  // 价格获取的时间间隔
  priceGainInterval: number;

  //价格下降的次数
  priceGainDownTimes: number;

  //上次买入的下降概率
  lastBuyDownRate: number;

  //这次买入的下降概率
  currentBuyDownRate: number;

  //下次买入的下降概率
  nextBuyDownRate: number;

  //买入概率下降间隔
  buyDownRateInterval: number;

  //是否套牢, 套牢后不再买入, 止损
  isLock: boolean;

  //历史最高价格
  historyMaxPrice: number;

  //历史最低价格
  historyMinPrice: number;

  //交易对
  symbol: string;
}
export const TraderModel = getModelForClass(Trader);
