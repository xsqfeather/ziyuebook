import { controller, get, options, route, put, post } from "hapi-decorators";
import {
  MController,
  ListData,
  ListQuerySchema,
  ListQueryDto,
} from "../../lib";
import { Inject, Service } from "typedi";
import * as hapi from "@hapi/hapi";
import { Product, ProductCategoryModel, ProductModel } from "../../models";
import { ProductService } from "../../services";
import {
  XianProductPublishManyDto,
  XianProductPublishManyDtoSchema,
} from "../../dtos";
import Joi from "joi";

@Service()
@controller("/api/products_on_xian_banned")
export class ProductOnXianBannedApiController extends MController {
  @Inject(() => ProductService)
  productService!: ProductService;
  @get("/")
  @options({
    tags: ["api", "商品"],
    description: "违禁商品列表",
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
        bannedOnXian: {
          $exists: true,
          $eq: true,
        },
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

  @post("/")
  @options({
    tags: ["api", "商品"],
    description: "添加违禁ISBN",
    notes: "返回闲管家",
    validate: {
      payload: Joi.object({
        isbn: Joi.string().required().description("ISBN"),
      }),
    },
  })
  async bannedToXian(req: hapi.Request): Promise<any> {
    const input = req.payload as any;
    console.log({ input });
    return this.productService.banProductOnXianByISBN(input.isbn);
  }

  @post("/many")
  @options({
    tags: ["api", "商品"],
    description: "添加违禁ISBN",
    notes: "返回闲管家",
    validate: {
      payload: Joi.object({
        productIds: Joi.array().items(Joi.string()).description("ISBN"),
      }),
    },
  })
  async bannedToXians(req: hapi.Request): Promise<any> {
    const products = await ProductModel.find({
      id: {
        $in: (req.payload as any).productIds,
      },
    });

    const isbns = products.map((p) => p.bookData.isbn);

    for (let index = 0; index < isbns.length; index++) {
      const isbn = isbns[index];
      await this.productService.banProductOnXianByISBN(isbn);
    }

    return isbns;
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
