import { controller, get, options, put } from "hapi-decorators";
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

  @put("/put_from_excel")
  @options({
    description: "从excel导入商品",
    notes: "返回被更新的文章ID",
    tags: ["api", "商品"],
    auth: {
      strategies: ["jwt"],
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
    validate: {
      failAction: (request, h, err) => {
        console.error(err);

        throw err;
      },
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
      },
    },
  })
  async putFromExcel(req: Request): Promise<string[]> {
    try {
      return this.productService.putCreateExcel(req.payload);
    } catch (error) {
      console.error(error);
    }
  }
}
