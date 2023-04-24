import { controller, get, options } from "hapi-decorators";
import {
  MController,
  ListData,
  ListQuerySchema,
  ListQueryDto,
} from "../../lib";
import { Inject, Service } from "typedi";
import { Request } from "@hapi/hapi";
import { Product } from "models";
import { ProductService } from "services";

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

  @get("/check_excel_input_state")
  @options({
    tags: ["api", "商品"],
    description: "查询商品导入状态",
    notes: "测试",
  })
  async checkExcelInputState(req: Request): Promise<any> {}
}
