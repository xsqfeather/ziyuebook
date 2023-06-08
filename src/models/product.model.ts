import {
  getModelForClass,
  index,
  modelOptions,
  prop,
} from "@typegoose/typegoose";
import { getSchema } from "joi-typescript-validator";
import { Base } from "../lib/models";
import { SchemaTypes } from "mongoose";

export class Book {
  title!: string;
  publishTime?: Date;
  publishVersion?: number;
  cover!: string;
  isbn!: string;
  pageAmount?: number;
  //原价
  bookPrice!: number;

  series?: string;

  seriesId?: string;

  originalName?: string;

  //当前售卖总价
  price!: number;
  //当前快递费用
  sellPrice!: number;
  //当前快递费用
  sellShipPrice!: number;

  //以下是孔网地址
  newPrice!: number;
  newSellPrice!: number;
  newShipPrice!: number;
  authors!: string[];
  publisher?: string;
  publisherId?: string;
  //装帧
  binding!: string;
  //开本
  format!: string;
  //纸张
  paper!: string;
  //分类
  category!: string;
  categoryId!: string;

  contentLang?: string;

  buyAmount?: number;

  wordAmount?: number;

  contentIntro?: string;

  authorIntro?: string;
  catalog?: string;
}

export class XianProduct {
  product_id!: string;
  item_biz_type!: number;
  sp_biz_type!: number;
  channel_cat_id!: string;
  original_price!: number;
  price!: number;
  stock!: number;
  title!: string;
  district_id!: number;
  outer_id!: string;
  stuff_status!: number;
  express_fee!: number;
  product_status!: number;
  spec_type!: number;
  source!: number;
  online_time!: number;
  offline_time!: number;
  sold_time?: number;
  modify_time?: number;
  create_time?: number;
  images?: string[];
  desc?: string;
  sku_items?: {
    price: number;
    stock: number;
    sku_text: string;
    outer_id: string;
  }[];
  book_data?: {
    title: string;
    author: string;
    publisher: string;
    isbn: string;
  };
  sp_guarantee?: string;
  support_sdr_policy?: 1 | 0;
  support_nfr_policy?: 1 | 0;
  report_data: any; //这个字段待定填写
}
@modelOptions({ options: { allowMixed: 0 } })
@index({
  title: 1,
  "bookData.title": 1,
  "bookData.author": 1,
  needToAdjustLatestPrice: 1,
  categoryId: 1,
  category: 1,
  "bookData.isbn": 1,
})
export class Product extends Base {
  @prop({
    type: Object,
  })
  xian?: XianProduct;

  @prop({
    type: String,
    default: "",
  })
  xianProductId?: string;

  @prop({
    type: Boolean,
    default: false,
  })
  fromXianInfoAsync?: boolean;

  @prop({
    type: Boolean,
    default: false,
  })
  onXian!: boolean;

  @prop({
    type: Object,
  })
  bookData!: Book;

  @prop({ type: Number, default: 0 })
  profitRate?: number;

  @prop({
    type: String,
    default: false,
  })
  type!: "book" | "course" | "other";

  @prop({
    type: String,
  })
  title?: string;

  @prop({
    type: SchemaTypes.Array,
  })
  images?: string[];

  //品相
  @prop({
    type: String,
  })
  appearance?: string;

  @prop({
    type: String,
    default: "",
  })
  cover!: string;

  @prop({
    type: String,
    default: "",
  })
  originUrl!: string;

  @prop({
    type: Number,
    default: 0,
  })
  stock!: number;

  @prop({ type: Number })
  price!: number;

  @prop({ type: Number })
  goodPrice!: number;

  @prop({ type: Number })
  shipPrice!: number;

  @prop({ type: Number })
  boughtCount!: number;

  //分类
  @prop({ type: String })
  category?: string;

  @prop({ type: String })
  categoryId?: string;

  @prop({ type: Boolean, default: false })
  needToAdjustLatestPrice!: boolean;

  @prop({ type: Date, default: Date.now })
  lastCheckTime?: Date;

  @prop({ type: String, default: "" })
  buyUrlOnKong!: string;

  @prop({ type: Boolean, default: false })
  bannedOnXian!: boolean;
}

export const ProductModel = getModelForClass(Product);
export const ProductSchema = getSchema(Product);
