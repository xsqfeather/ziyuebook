import axios from "axios";
import { MD5 } from "crypto-js";
import { PRODUCT_JOB } from "../jobs/namespaces";
import { LevelCacheService } from "../lib/services";
import { ProductModel } from "../models/product.model";
import moment from "moment";

import { Inject, Service } from "typedi";
import { XianProductCreateDto, XianProductEditDto } from "../dtos";
import { KongProductService } from "./kong.product.service";

const XIANGUANJIA_APP_KEY = "395975399510085";

const XIANGUANJIA_APP_SECRET = "7eHkPauNq4AslcmKKjaOzUrkYLaHA8Zs";

@Service()
export class XianProductService {
  @Inject(() => LevelCacheService)
  levelCacheService: LevelCacheService;

  @Inject(() => KongProductService)
  kongProductService: KongProductService;

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
      page_size: 99,
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

    const config = {
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

    let exitsProduct = await ProductModel.findOne({
      "bookData.isbn": productDetail.book_data?.isbn,
    });

    const profitRate =
      (+productDetail.price -
        (exitsProduct?.bookData?.price ||
          exitsProduct?.bookData?.newPrice ||
          0)) /
      (exitsProduct?.bookData?.price || exitsProduct?.bookData?.newPrice);

    console.log("profitRate", { profitRate });

    if (!exitsProduct) {
      try {
        await this.kongProductService.getProductDetailFromISBN(
          productDetail.book_data?.isbn
        );
        exitsProduct = await ProductModel.findOne({
          "bookData.isbn": productDetail.book_data?.isbn,
        });
        const profitRate =
          (+productDetail.price - (exitsProduct?.bookData?.price || 0)) /
          exitsProduct?.bookData?.price;
        const rlt = await ProductModel.updateOne(
          {
            "bookData.isbn": productDetail.book_data?.isbn,
          },
          {
            $set: {
              onXian: true,
              xian: productDetail,
              price: productDetail.price,
              xianProductId: productDetail.product_id,
              profitRate: !Number.isNaN(profitRate) ? profitRate : 0,
              stock: productDetail.stock,
            },
          }
        );
        console.log("==========新建了", rlt.modifiedCount, "条数据==========");
      } catch (error) {
        console.log("==========获取kong产品详情失败==========", error);
      }
    } else {
      const rlt = await ProductModel.updateOne(
        {
          "bookData.isbn": productDetail.book_data?.isbn,
        },
        {
          $set: {
            onXian: true,
            xian: productDetail,
            price: productDetail.price,
            profitRate: !Number.isNaN(profitRate) ? profitRate : 0,
            xianProductId: productDetail.product_id,
            stock: productDetail.stock,
            updatedAt: new Date(),
          },
        }
      );
      console.log("==========更新了", rlt.modifiedCount, "条数据==========");
    }

    return productDetail;
  }

  async createNewProduct(input: XianProductCreateDto) {
    const data = JSON.parse(JSON.stringify(input));

    const timestamp = Math.floor(new Date().getTime() / 1000);
    const sign = this.sign(
      XIANGUANJIA_APP_KEY,
      XIANGUANJIA_APP_SECRET,
      timestamp,
      data
    );

    const config = {
      method: "post",
      url: `https://api.goofish.pro/sop/product/create?appid=${XIANGUANJIA_APP_KEY}&timestamp=${timestamp}&sign=${sign}`,
      headers: {
        "User-Agent": "Apifox/1.0.0 (https://www.apifox.cn)",
        "Content-Type": "application/json",
      },
      data: data,
    };

    const { data: createRlt } = await axios(config);
    return createRlt;
  }

  async adjustProductPrice(input: { xianProductId: string; price: number }) {
    return this.editXianProduct({
      price: input.price,
      product_id: input.xianProductId,
    });
  }

  async editXianProduct(input: XianProductEditDto) {
    const data = JSON.parse(JSON.stringify(input));
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const sign = this.sign(
      XIANGUANJIA_APP_KEY,
      XIANGUANJIA_APP_SECRET,
      timestamp,
      data
    );

    const config = {
      method: "post",
      url: `https://api.goofish.pro/sop/product/edit?appid=${XIANGUANJIA_APP_KEY}&timestamp=${timestamp}&sign=${sign}`,
      headers: {
        "User-Agent": "Apifox/1.0.0 (https://www.apifox.cn)",
        "Content-Type": "application/json",
      },
      data: data,
    };

    const { data: updateRlt } = await axios(config);
    return updateRlt;
  }

  async deleteXianProduct(productId: string) {
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
      url: `https://api.goofish.pro/sop/product/delete?appid=${XIANGUANJIA_APP_KEY}&timestamp=${timestamp}&sign=${sign}`,

      data: data,
    };

    const { data: deleteRlt } = await axios(config);
    return deleteRlt;
  }
}
