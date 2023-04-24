import axios from "axios";
import { MD5 } from "crypto-js";
import { PRODUCT_JOB } from "jobs/namespaces";
import { LevelCacheService } from "lib/services";
import { ProductModel } from "models/product.model";
import moment from "moment";

import { Inject, Service } from "typedi";

const XIANGUANJIA_APP_KEY = "395975399510085";

const XIANGUANJIA_APP_SECRET = "7eHkPauNq4AslcmKKjaOzUrkYLaHA8Zs";

@Service()
export class XianProductService {
  @Inject(() => LevelCacheService)
  levelCacheService: LevelCacheService;

  sign(appKey: string, appSecret: string, timestamp: number, body: any) {
    const bodyMd5 = MD5(JSON.stringify(body)).toString();
    const signMd5 = MD5(
      `${appKey},${bodyMd5},${timestamp},${appSecret}`
    ).toString();
    return signMd5;
  }

  async getProducts(page: string) {
    const start_modified = Math.floor(
      moment().subtract(2, "month").toDate().getTime() / 1000
    );
    const data = {
      start_modified,
      page_no: page,
    };

    const timestamp = Math.floor(new Date().getTime() / 1000);

    const sign = this.sign(
      XIANGUANJIA_APP_KEY,
      XIANGUANJIA_APP_SECRET,
      timestamp,
      data
    );

    const config = {
      method: "post",
      url: `https://api.goofish.pro/sop/product/list?appid=${XIANGUANJIA_APP_KEY}&timestamp=${timestamp}&sign=${sign}`,
      data: data,
    };

    const { data: productListData } = await axios(config);
    if (productListData.status === 1012) {
      const levelKey = PRODUCT_JOB + "FromXianList" + "currentPage";
      await this.levelCacheService.put(levelKey, 1);
      console.log("没有更多数据了");
      return;
    }
    for (let index = 0; index < productListData?.data.length; index++) {
      const xianProduct = productListData?.data[index];
      const product = new ProductModel({
        xian: xianProduct,
        xianProductId: xianProduct.product_id,
        title: xianProduct.title,
        price: xianProduct.price,
        stock: xianProduct.stock,
        onXian: false,
      });
      const existProduct = await ProductModel.findOne({
        xianProductId: xianProduct.product_id,
      });
      if (!existProduct) {
        console.log(xianProduct.product_id + "不存在", "创建");
        const detail = await this.getProductDetail(xianProduct.product_id);
        product.onXian = true;
        product.xian = detail;
        product.cover = detail?.images[0];
        product.bookData = detail?.book_data;
        await product.save();
      } else {
        console.log(xianProduct.product_id + "已存在", "跳过");
      }
    }
    if (!productListData?.data && productListData?.data?.length === 0) {
      const levelKey = PRODUCT_JOB + "FromXianList" + "currentPage";
      await this.levelCacheService.put(levelKey, 1);
      console.log("没有更多数据了");
    }
  }

  async getProductDetail(productId: string) {
    const data = {
      product_id: productId,
    };
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const sign = this.sign(
      XIANGUANJIA_APP_KEY,
      XIANGUANJIA_APP_SECRET,
      timestamp,
      data
    );

    var config = {
      method: "post",
      url: `https://api.goofish.pro/sop/product/query?appid=${XIANGUANJIA_APP_KEY}&timestamp=${timestamp}&sign=${sign}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const { data: detail } = await axios(config);
    const { data: productDetail } = detail;
    const existProduct = await ProductModel.findOne({
      xianProductId: productId,
    });
    await ProductModel.updateOne(
      {
        xianProductId: productId,
      },
      {
        $inc: {
          getDetailTime: 1,
        },
      }
    );
    if (existProduct?.onXian) {
      return false;
    }

    return productDetail;
  }
}
