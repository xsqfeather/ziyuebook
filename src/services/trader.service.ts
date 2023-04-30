import { Trader, TraderModel } from "../models/trader.model";
import { BaseService } from "./base.service";

export class TraderService extends BaseService<Trader> {
  async create(trader: Trader) {
    const newTrader = new Trader();
    newTrader.id = trader.id;
    newTrader.initAmount = trader.initAmount;
    return trader;
  }
  async findAll() {
    return TraderModel.find();
  }

  async findOne(id: string) {
    return TraderModel.findOne({ id });
  }

  async buyAll() {
    return "buyAll";
  }

  async decideToBuy(price: number) {
    return "decideToBuy";
  }
}
