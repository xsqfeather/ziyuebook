export class XianProductCreateDto {
  /**
   * 图书信息，仅图书商品传入
   */
  book_data?: BookDataDto;
  /**
   * 商品类目ID，示例：e11455b218c06e7ae10cfa39bf43dc0f
   */
  channel_cat_id: string;
  /**
   * 商品描述，注意：不支持HTML代码，可使用\n换行
   */
  desc: string;
  /**
   * 发货地区ID，示例：440305
   */
  district_id: number;
  /**
   * 运费（分），示例：100
   */
  express_fee?: number;
  /**
   * 商品图片URL，示例：[xx,xx]（第一张为商品主图）
   */
  images: string[];
  /**
   * 商品类型ID，示例：2
   */
  item_biz_type: number;
  /**
   * 商品原价（分），示例：299900
   */
  original_price?: number;
  /**
   * 商家编码，示例：317837811
   */
  outer_id?: string;
  /**
   * 商品售价（分），示例：199900（多规格商品，必须是SKU其中一个金额）
   */
  price: number;
  /**
   * 验货报告信息，仅已验货自检商品类型传入
   */
  report_data?: ReportDataDto;
  /**
   * 商品SKU，注意：最多设置两个规格，每个规格限制1~20个属性值
   */
  sku_items?: SkuItem[];
  /**
   * 商品分类ID，示例：1
   */
  sp_biz_type: number;
  /**
   * 商品标签，示例：1,2（最多设置两个）
   *
   * ------
   * **标签字典:**
   * `1`: 100%验货
   * `2`: 正品鉴别
   * `3`: 七天包退
   * `4`: 一年质保
   * `5`: 48小时发货
   * `7`: 质量问题包退
   * `8`: 一物一证
   */
  sp_guarantee?: string;
  /**
   * 商品库存，示例：99（多规格商品，必须是SKU库存的合计）
   */
  stock: number;
  /**
   * 商品成色，示例：100（非普通商品类型时必填）
   */
  stuff_status?: number;
  /**
   * 是否支持极速发货-10分钟
   */
  support_fd10ms_policy?: number;
  /**
   * 是否支持极速发货-24小时
   */
  support_fd24hs_policy?: number;
  /**
   * 是否支持描述不符包邮退
   */
  support_nfr_policy?: number;
  /**
   * 是否支持七天无理由
   */
  support_sdr_policy?: number;
  /**
   * 商品标题，示例：iPhone 12 128G 黑色
   */
  title: string;
}

/**
 * 图书信息，仅图书商品传入
 */
export class BookDataDto {
  /**
   * 作者，示例：李敖
   */
  author: string;
  /**
   * ISBN码，示例：9787505720176
   */
  isbn: string;
  /**
   * 出版社，示例：中国友谊出版公司
   */
  publisher: string;
  /**
   * 书名，示例：北京法源寺
   */
  title: string;
}

/**
 * 美妆信息，仅美妆分类传入
 */
export interface BeautyMakeupDto {
  /**
   * 品牌，示例：欧莱雅
   */
  brand: string;
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 成色，示例：全新
   */
  level: string;
  /**
   * 检测机构ID，示例：181
   */
  org_id: number;
  /**
   * 规格，示例：小瓶装
   */
  spec: string;
}

/**
 * 文玩信息，仅文玩分类传入
 */
export interface Curio {
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 材质，示例：陶瓷
   */
  material: string;
  /**
   * 检测机构ID，示例：191
   */
  org_id: number;
  /**
   * 鉴定编码，示例：3131319
   */
  qc_no: string;
  /**
   * 尺寸，示例：12mmx14mm
   */
  size: string;
}

/**
 * 游戏信息，仅信息分类传入
 */
export interface GameDto {
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 游戏平台，示例：任天堂
   */
  platform: string;
  /**
   * 验货结论，示例：无瑕疵
   */
  qc_desc: string;
  /**
   * 鉴定编码，示例：3131319
   */
  qc_no: string;
  /**
   * 验货标题，示例：超级马里奥奥德赛
   */
  title: string;
}

/**
 * 珠宝信息，仅珠宝分类传入
 */
export interface JewelryDto {
  /**
   * 颜色，示例：白色
   */
  color: string;
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 检测机构，示例：某某平台
   */
  org_name: string;
  /**
   * 验货结论，示例：无瑕疵
   */
  qc_desc: string;
  /**
   * 鉴定编码，示例：3131319
   */
  qc_no: string;
  /**
   * 形状，示例：圆形
   */
  shape: string;
  /**
   * 重量，示例：125g
   */
  weight: string;
}

/**
 * 二手车信息，仅二手车分类传入
 */
export interface UsedCar {
  /**
   * 验货报告 URL，示例：https://xx.com/xx.html
   */
  report_url: string;
}

/**
 * 奢品信息，仅奢品分类传入
 */
export interface Valuable {
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 检测机构ID，示例：161
   */
  org_id: number;
  /**
   * 验货结论，示例：无瑕疵
   */
  qc_desc: string;
  /**
   * 鉴定编码，示例：3131319
   */
  qc_no: string;
}

/**
 * 虚拟账号/租号信息，仅虚拟账号/租号分类传入
 */
export interface VirtualAccount {
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 游戏名称，示例：王者荣耀
   */
  name: string;
  /**
   * 验货结论，示例：无瑕疵
   */
  qc_desc: string;
  /**
   * 鉴定编码，示例：3131319
   */
  qc_no: string;
  /**
   * 验货标题，示例：王者荣耀王者账号
   */
  title: string;
  /**
   * 类型，示例：自抽号
   */
  type: string;
}

export interface SkuItem {
  /**
   * 商家SKU编码，示例：317837811-1
   */
  outer_id: string;
  /**
   * SKU售价（分），示例：199900
   */
  price: number;
  /**
   * SKU规格，示例：颜色:黑色;容量:128G
   * 注意：规格名称限制4个字符以内，属性值限制20个字符以内
   */
  sku_text: string;
  /**
   * SKU库存，示例：99
   */
  stock: number;
}

export class XianProductEditDto {
  /**
   * 图书信息，仅图书商品传入
   */
  book_data?: BookData;
  /**
   * 商品类目ID，示例：e11455b218c06e7ae10cfa39bf43dc0f
   */
  channel_cat_id?: string;
  /**
   * 商品描述，注意：不支持HTML代码，可使用\n换行
   */
  desc?: string;
  /**
   * 发货地区ID，示例：440305
   */
  district_id?: number;
  /**
   * 运费（分），示例：100
   */
  express_fee?: number;
  /**
   * 商品图片URL，示例：[xx,xx]（第一张为商品主图）
   */
  images?: string[];
  /**
   * 商品类型ID，示例：2
   */
  item_biz_type?: number;
  /**
   * 商品原价（分），示例：299900
   */
  original_price?: number;
  /**
   * 商家编码，示例：317837811
   */
  outer_id?: string;
  /**
   * 商品售价（分），示例：199900（多规格商品，必须是SKU其中一个金额）
   */
  price?: number;
  /**
   * 管家商品ID，示例：219530767978565
   */
  product_id: string;
  /**
   * 验货报告信息，仅已验货自检商品类型传入
   */
  report_data?: ReportDataDto;
  /**
   * 商品SKU，注意：最多设置两个规格，每个规格限制1~20个属性值
   */
  sku_items?: SkuItem[];
  /**
   * 商品分类ID，示例：1
   */
  sp_biz_type?: number;
  /**
   * 商品标签，示例：1,2（最多设置两个）
   *
   * ------
   * **标签字典:**
   * `1`: 100%验货
   * `2`: 正品鉴别
   * `3`: 七天包退
   * `4`: 一年质保
   * `5`: 48小时发货
   * `7`: 质量问题包退
   * `8`: 一物一证
   */
  sp_guarantee?: string;
  /**
   * 商品库存，示例：99（多规格商品，必须是SKU库存的合计）
   */
  stock?: number;
  /**
   * 商品成色，示例：100（非普通商品类型时必填）
   */
  stuff_status?: number;
  /**
   * 是否支持极速发货-10分钟
   */
  support_fd10ms_policy?: number;
  /**
   * 是否支持极速发货-24小时
   */
  support_fd24hs_policy?: number;
  /**
   * 是否支持描述不符包邮退
   */
  support_nfr_policy?: number;
  /**
   * 是否支持七天无理由
   */
  support_sdr_policy?: number;
  /**
   * 商品标题，示例：iPhone 12 128G 黑色
   */
  title?: string;
}

/**
 * 图书信息，仅图书商品传入
 */
export interface BookData {
  /**
   * 作者，示例：李敖
   */
  author: string;
  /**
   * ISBN码，示例：9787505720176
   */
  isbn: string;
  /**
   * 出版社，示例：中国友谊出版公司
   */
  publisher: string;
  /**
   * 书名，示例：北京法源寺
   */
  title: string;
}

/**
 * 验货报告信息，仅已验货自检商品类型传入
 */
export class ReportDataDto {
  /**
   * 美妆信息，仅美妆分类传入
   */
  beauty_makeup?: BeautyMakeup;
  /**
   * 文玩信息，仅文玩分类传入
   */
  curio?: Curio;
  /**
   * 游戏信息，仅信息分类传入
   */
  game?: Game;
  /**
   * 珠宝信息，仅珠宝分类传入
   */
  jewelry?: Jewelry;
  /**
   * 二手车信息，仅二手车分类传入
   */
  used_car?: UsedCar;
  /**
   * 奢品信息，仅奢品分类传入
   */
  valuable?: Valuable;
  /**
   * 虚拟账号/租号信息，仅虚拟账号/租号分类传入
   */
  virtual_account?: VirtualAccount;
}

/**
 * 美妆信息，仅美妆分类传入
 */
export interface BeautyMakeup {
  /**
   * 品牌，示例：欧莱雅
   */
  brand: string;
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 成色，示例：全新
   */
  level: string;
  /**
   * 检测机构ID，示例：181
   */
  org_id: number;
  /**
   * 规格，示例：小瓶装
   */
  spec: string;
}

/**
 * 文玩信息，仅文玩分类传入
 */
export interface Curio {
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 材质，示例：陶瓷
   */
  material: string;
  /**
   * 检测机构ID，示例：191
   */
  org_id: number;
  /**
   * 鉴定编码，示例：3131319
   */
  qc_no: string;
  /**
   * 尺寸，示例：12mmx14mm
   */
  size: string;
}

/**
 * 游戏信息，仅信息分类传入
 */
export interface Game {
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 游戏平台，示例：任天堂
   */
  platform: string;
  /**
   * 验货结论，示例：无瑕疵
   */
  qc_desc: string;
  /**
   * 鉴定编码，示例：3131319
   */
  qc_no: string;
  /**
   * 验货标题，示例：超级马里奥奥德赛
   */
  title: string;
}

/**
 * 珠宝信息，仅珠宝分类传入
 */
export interface Jewelry {
  /**
   * 颜色，示例：白色
   */
  color: string;
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 检测机构，示例：某某平台
   */
  org_name: string;
  /**
   * 验货结论，示例：无瑕疵
   */
  qc_desc: string;
  /**
   * 鉴定编码，示例：3131319
   */
  qc_no: string;
  /**
   * 形状，示例：圆形
   */
  shape: string;
  /**
   * 重量，示例：125g
   */
  weight: string;
}

/**
 * 二手车信息，仅二手车分类传入
 */
export interface UsedCar {
  /**
   * 验货报告 URL，示例：https://xx.com/xx.html
   */
  report_url: string;
}

/**
 * 奢品信息，仅奢品分类传入
 */
export interface Valuable {
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 检测机构ID，示例：161
   */
  org_id: number;
  /**
   * 验货结论，示例：无瑕疵
   */
  qc_desc: string;
  /**
   * 鉴定编码，示例：3131319
   */
  qc_no: string;
}

/**
 * 虚拟账号/租号信息，仅虚拟账号/租号分类传入
 */
export interface VirtualAccount {
  /**
   * 验货图片URL，示例：[xx,xx]
   */
  images: string[];
  /**
   * 游戏名称，示例：王者荣耀
   */
  name: string;
  /**
   * 验货结论，示例：无瑕疵
   */
  qc_desc: string;
  /**
   * 鉴定编码，示例：3131319
   */
  qc_no: string;
  /**
   * 验货标题，示例：王者荣耀王者账号
   */
  title: string;
  /**
   * 类型，示例：自抽号
   */
  type: string;
}

export interface SkuItem {
  /**
   * 商家SKU编码，示例：317837811-1
   */
  outer_id: string;
  /**
   * SKU售价（分），示例：199900
   */
  price: number;
  /**
   * SKU规格，示例：颜色:黑色;容量:128G
   * 注意：规格名称限制4个字符以内，属性值限制20个字符以内
   */
  sku_text: string;
  /**
   * SKU库存，示例：99
   */
  stock: number;
}
