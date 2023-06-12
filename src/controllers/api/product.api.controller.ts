import { controller, get, options, route, put, post } from "hapi-decorators";
import {
  MController,
  ListData,
  ListQuerySchema,
  ListQueryDto,
} from "../../lib";
import { Inject, Service } from "typedi";
import * as hapi from "@hapi/hapi";
import { Product, ProductCategoryModel } from "../../models";
import { ProductService } from "../../services";
import {
  ImportXianExcelDto,
  ImportXianExcelSchema,
  XianProductPublishDto,
  XianProductPublishDtoSchema,
  XianProductPublishManyDto,
  XianProductPublishManyDtoSchema,
} from "../../dtos";
import Joi from "joi";

@Service()
@controller("/api/products")
export class ProductApiController extends MController {
  @Inject(() => ProductService)
  productService!: ProductService;
  @get("/")
  @options({
    tags: ["api", "商品"],
    description: "查询商品列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<Product>> {
    const query = req.query as ListQueryDto;
    let listQuery = this.parseListQuery<Product>(query);
    if ((listQuery.filter as any).xian_product_status) {
      listQuery = {
        ...listQuery,
        filter: {
          ...listQuery.filter,
          "xian.product_status": +(listQuery.filter as any).xian_product_status,
          xian_product_status: undefined,
        } as any,
      };
    }

    listQuery = JSON.parse(JSON.stringify(listQuery));

    if (listQuery.filter?.categoryId && listQuery.filter.categoryId !== "") {
      const childCateIds = await ProductCategoryModel.find({
        superCategoryId: listQuery.filter.categoryId,
      });
      const childChildCateIds = [];
      for (let index = 0; index < childCateIds.length; index++) {
        const childChildCates = await ProductCategoryModel.find({
          superCategoryId: childCateIds[index].superCategoryId,
        });
        childChildCateIds.push(...childChildCates);
      }
      listQuery = {
        ...listQuery,
        filter: {
          ...listQuery.filter,
          categoryId: {
            $in: [
              ...childCateIds.map((item) => item._id),
              ...childChildCateIds.map((item) => item.id),
              listQuery.filter.categoryId,
            ],
          },
        },
      };
    }
    return this.productService.getProductList(listQuery);
  }

  @post("/add_from_xian_excel")
  @options({
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
    tags: ["api", "商品"],
    description: "上传xlsx文件添加到产品库",
    notes: "返回产品库",
    validate: {
      payload: ImportXianExcelSchema,
      failAction: async (request, h, err) => {
        console.log(err);
        throw err;
      },
    },
    payload: {
      output: "file",
      parse: true,
      maxBytes: 1024 * 1024 * 100, //100m
      allow: "multipart/form-data",
      multipart: {
        output: "file",
      },
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
      },
    },
  })
  async addFromXianExcel(req: hapi.Request): Promise<any> {
    try {
      const input = req.payload as ImportXianExcelDto;
      console.log({ input });

      return this.productService.importFromXianExcel(input);
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @put("/publish_to_xian")
  @options({
    tags: ["api", "商品"],
    description: "添加到闲管家",
    notes: "返回闲管家",
    validate: {
      payload: XianProductPublishDtoSchema,
    },
  })
  async updateToXian(req: hapi.Request): Promise<any> {
    const input = req.payload as XianProductPublishDto;
    console.log({ input });

    return this.productService.putXianProduct(input);
  }

  @post("/publish_many_to_xian")
  @options({
    tags: ["api", "商品"],
    description: "批量添加商品添加到闲管家",
    notes: "返回productIds",
    validate: {
      payload: Joi.object({
        productIds: Joi.array()
          .items(Joi.string())
          .description("商品Id数组")
          .default([]),
      }),
    },
  })
  async publishManyToXian(req: hapi.Request): Promise<any> {
    const input = req.payload as {
      productIds: string[];
    };

    return this.productService.putXianProducts(input);
  }

  @put("/publish_many_price_to_xian")
  @options({
    tags: ["api", "商品"],
    description: "批量调整价格到闲管家",
    notes: "返回闲管家商品ID数组",
    validate: {
      payload: XianProductPublishManyDtoSchema,
    },
  })
  async updateManyPriceToXian(req: hapi.Request): Promise<any> {
    const input = req.payload as XianProductPublishManyDto;
    return this.productService.adjustPricesProduct(input);
  }

  @get("/{id}")
  @options({
    tags: ["api", "商品"],
    description: "查询商品详情",
    notes: "测试",
    validate: {
      params: Joi.object({
        id: Joi.string().required().description("商品ID"),
      }),
    },
  })
  async detail(req: hapi.Request): Promise<Product | null> {
    const id = req.params.id;
    return this.productService.getProductById(id);
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "商品"],
    description: "删除商品",
    notes: "测试",
  })
  async delete(req: hapi.Request): Promise<any> {
    const id = req.params.id;
    return this.productService.deleteProductById(id);
  }
}
