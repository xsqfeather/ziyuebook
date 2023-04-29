import { Trader, TraderModel } from "../models/trader.model";

export class TraderService {
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
}
