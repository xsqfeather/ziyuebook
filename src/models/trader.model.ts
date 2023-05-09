import { getModelForClass, modelOptions } from "@typegoose/typegoose";
import { Base } from "../lib/models";

@modelOptions({ options: { allowMixed: 0 } })
export class Trader extends Base {
  initAmount: number;
  availableAmount: number;
  frozenAmount: number;

  //历史最高价格
  historyMaxPrice: number;

  //历史最低价格
  historyMinPrice: number;

  //在左边一边的价格出现的次数
  leftCount: number;

  //在右边一边的价格出现的次数
  rightCount: number;

  //交易对
  symbol: string;

  //状态： 0: 正常 1: 暂停 2: 停止
  status: string;
}
export const TraderModel = getModelForClass(Trader);
