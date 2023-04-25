import axios from "axios";
import { MD5 } from "crypto-js";
import { PRODUCT_JOB } from "../jobs/namespaces";
import { LevelCacheService } from "../lib/services";
import { ProductModel } from "../models/product.model";
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

      await this.getProductDetail(xianProduct.product_id);
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
    if (!productDetail.book_data?.isbn || productDetail.book_data?.isbn == "") {
      return;
    }

    const rlt = await ProductModel.updateOne(
      {
        "bookData.isbn": productDetail.book_data?.isbn,
        onXian: false,
      },
      {
        $set: {
          onXian: true,
          updatedAt: new Date(),
          xian: productDetail,
          xianProductId: productDetail.product_id,
        },
      }
    );
    console.log("==========更新了", rlt.modifiedCount, "条数据==========");

    return productDetail;
  }
}