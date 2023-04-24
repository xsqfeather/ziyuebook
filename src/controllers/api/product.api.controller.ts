import { controller, get, options } from "hapi-decorators";
import {
  MController,
  ListData,
  ListQuerySchema,
  ListQueryDto,
} from "../../lib";
import { Inject, Service } from "typedi";
import { Request } from "@hapi/hapi";
import { Product } from "../../models";
import { ProductService } from "../../services";

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
    const listQuery = this.parseListQuery<Product>(query);
    return this.productService.getProductList(listQuery);
  }

  @get("/add_to_xian")
  @options({
    tags: ["api", "商品"],
    description: "添加到闲管家",
    notes: "返回闲管家",
  })
  async addToXian(req: Request): Promise<any> {}

  @get("/update_to_xian")
  @options({
    tags: ["api", "商品"],
    description: "添加到闲管家",
    notes: "返回闲管家",
  })
  async updateToXian(req: Request): Promise<any> {}
}
