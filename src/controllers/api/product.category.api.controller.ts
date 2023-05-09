import { controller, get, options, route } from "hapi-decorators";
import {
  MController,
  ListData,
  ListQuerySchema,
  ListQueryDto,
} from "../../lib";
import { Inject, Service } from "typedi";
import { Request } from "@hapi/hapi";
import { ProductCategory } from "../../models";
import { ProductCategoryService } from "../../services";

@Service()
@controller("/api/product_categories")
export class ProductCategoryApiController extends MController {
  @Inject(() => ProductCategoryService)
  productCategoryService: ProductCategoryService;
  @get("/")
  @options({
    tags: ["api", "商品"],
    description: "查询商品列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: Request): Promise<ListData<ProductCategory>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<ProductCategory>(query);

    return this.productCategoryService.getProductCategoryList(listQuery);
  }

  @get("/add_to_xian")
  @options({
    tags: ["api", "商品"],
    description: "添加到闲管家",
    notes: "返回闲管家",
  })
  async addToXian(req: Request): Promise<any> {}

  @route("delete", "/{id}")
  @options({
    tags: ["api", "商品"],
    description: "删除商品",
    notes: "测试",
  })
  async delete(req: Request): Promise<any> {
    const id = req.params.id;
    return this.productCategoryService.deleteById(id);
  }
}
