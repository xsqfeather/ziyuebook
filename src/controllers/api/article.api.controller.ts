import { controller, get, options, post } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { Article } from "../../models";
import { ArticleService } from "../../services";
import { Request } from "@hapi/hapi";
import { CreateArticleDto, CreateArticleSchema } from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";

@Service()
@controller("/api/articles")
export class ArticleApiController extends MController {
  @Inject(() => ArticleService)
  articleService!: ArticleService;

  @get("/")
  @options({
    tags: ["api", "文章"],
    description: "查询文章列表",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: Request): Promise<ListData<Article>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<Article>(query);
    return this.articleService.getArticleList(listQuery);
  }

  @post("/")
  @options({
    description: "新建文章",
    notes: "返回文章数据",
    tags: ["api", "文章"],
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
      payload: CreateArticleSchema,
    },
  })
  async create(req: Request): Promise<Article> {
    const input = req.payload as CreateArticleDto;
    return this.articleService.createArticle(input);
  }
}
