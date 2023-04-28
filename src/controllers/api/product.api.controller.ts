import { controller, get, options, route, put } from "hapi-decorators";
import {
  MController,
  ListData,
  ListQuerySchema,
  ListQueryDto,
} from "../../lib";
import { Inject, Service } from "typedi";
import { Request } from "@hapi/hapi";
import { Product, ProductCategoryModel } from "../../models";
import { ProductService } from "../../services";
import { XianProductPublishDto, XianProductPublishDtoSchema } from "dtos";
import Joi from "joi";

@Service()
@controller("/api/products")
export class ProductApiController extends MController {
  @Inject(() => ProductService)
  productService: ProductService;
  @get("/")
  @options({
    tags: ["api", "商品"],
    description: "查询商品列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: Request): Promise<ListData<Product>> {
    const query = req.query as ListQueryDto;
    let listQuery = this.parseListQuery<Product>(query);
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
  async updateToXian(req: Request): Promise<any> {
    const input = req.payload as XianProductPublishDto;
    return this.productService.putXianProduct(input);
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
  async detail(req: Request): Promise<Product> {
    const id = req.params.id;
    return this.productService.getProductById(id);
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "商品"],
    description: "删除商品",
    notes: "测试",
  })
  async delete(req: Request): Promise<any> {
    const id = req.params.id;
    return this.productService.deleteProductById(id);
  }
}
