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
  ImportXianExcelSchema,
  XianProductPublishDto,
  XianProductPublishDtoSchema,
  XianProductPublishManyDto,
  XianProductPublishManyDtoSchema,
} from "../../dtos";
import Joi from "joi";

@Service()
@controller("/api/products_on_xian_on_sale")
export class ProductOffXianOffSaleApiController extends MController {
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
    listQuery = {
      ...listQuery,
      filter: {
        ...listQuery.filter,
        onXian: true,
        "xian.product_status": 22,
      } as any,
    };

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

    return this.productService.putXianProduct(input);
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

  @post("/import_from_xian")
  @options({
    tags: ["api", "商品"],
    description: "从闲管家导入商品",
    notes: "测试",
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
    payload: {
      output: "stream",
      parse: true,
      maxBytes: 1024 * 1024 * 100, //100m
      allow: "multipart/form-data",
      multipart: {
        output: "stream",
      },
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
      },
    },
    validate: {
      payload: ImportXianExcelSchema,
    },
  })
  async importFromXian(req: hapi.Request): Promise<any> {
    const file = (req.payload as any)["file"];
    return this.productService.importFromXianFile(file._data);
  }
}
