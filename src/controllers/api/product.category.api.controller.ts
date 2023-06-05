import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { ProductCategory } from "../../models";
import { ProductCategoryService } from "../../services";
import { Request } from "@hapi/hapi";
import {
  CreateProductCategoryDto,
  CreateProductCategorySchema,
  UpdateProductCategoryDto,
  UpdateProductCategorySchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/post_categories")
export class ProductCategoryApiController extends MController {
  @Inject(() => ProductCategoryService)
  ProductCategoryService!: ProductCategoryService;

  @get("/")
  @options({
    tags: ["api", "商品分类"],
    description: "查询分类列表",
    notes: "返回商品分类",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: Request): Promise<ListData<ProductCategory>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<ProductCategory>(query);
    return this.ProductCategoryService.getProductCategoryList(listQuery);
  }

  @get("/{id}")
  @options({
    tags: ["api", "商品分类"],
    description: "查询分类详请",
    notes: "返回商品分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
    },
  })
  async getProductCategory(req: Request) {
    const id = req.params.id;
    return this.ProductCategoryService.getProductCategory(id);
  }

  @post("/{id}")
  @options({
    tags: ["api", "新建AV子分类"],
    description: "查询分类详请",
    notes: "返回商品分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: CreateProductCategorySchema,
    },
  })
  async postSubCategory(req: Request) {
    const id = req.params.id;
    return this.ProductCategoryService.createSubProductCategory(
      id,
      req.payload as CreateProductCategoryDto
    );
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "商品分类"],
    description: "删除分类",
    notes: "返回商品分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
    },
  })
  async deleteProductCategory(req: Request) {
    const id = req.params.id;
    return this.ProductCategoryService.removeProductCategory(id);
  }

  @put("/{id}")
  @options({
    tags: ["api", "商品分类"],
    description: "更新分类详请",
    notes: "商品分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: UpdateProductCategorySchema,
    },
  })
  async updateProductCategory(req: Request) {
    const id = req.params.id;
    return this.ProductCategoryService.updateProductCategory(
      id,
      req.payload as UpdateProductCategoryDto
    );
  }

  @post("/")
  @options({
    description: "新建分类",
    notes: "返回分类",
    tags: ["api", "商品分类"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
    validate: {
      payload: CreateProductCategorySchema,
    },
  })
  async create(req: Request): Promise<ProductCategory> {
    const input = req.payload as CreateProductCategoryDto;
    return this.ProductCategoryService.createProductCategory(input);
  }
}
