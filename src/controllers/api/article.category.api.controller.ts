import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { ArticleCategory } from "../../models";
import { ArticleCategoryService } from "../../services";
import * as hapi from "@hapi/hapi";
import {
  CreateArticleCategoryDto,
  CreateArticleCategorySchema,
  UpdateArticleCategoryDto,
  UpdateArticleCategorySchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/article_categories")
export class ArticleCategoryApiController extends MController {
  @Inject(() => ArticleCategoryService)
  ArticleCategoryService!: ArticleCategoryService;

  @get("/")
  @options({
    tags: ["api", "文章分类"],
    description: "查询分类列表",
    notes: "返回文章分类",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<ArticleCategory>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<ArticleCategory>(query);
    return this.ArticleCategoryService.getArticleCategoryList(listQuery);
  }

  @get("/{id}")
  @options({
    tags: ["api", "文章分类"],
    description: "查询分类详请",
    notes: "返回文章分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
    },
  })
  async getArticleCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.ArticleCategoryService.getArticleCategory(id);
  }

  @post("/{id}")
  @options({
    tags: ["api", "新建AV子分类"],
    description: "查询分类详请",
    notes: "返回文章分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: CreateArticleCategorySchema,
    },
  })
  async postSubCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.ArticleCategoryService.createSubArticleCategory(
      id,
      req.payload as CreateArticleCategoryDto
    );
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "文章分类"],
    description: "删除分类",
    notes: "返回文章分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
    },
  })
  async deleteArticleCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.ArticleCategoryService.removeArticleCategory(id);
  }

  @put("/{id}")
  @options({
    tags: ["api", "文章分类"],
    description: "更新分类详请",
    notes: "文章分类详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: UpdateArticleCategorySchema,
    },
  })
  async updateArticleCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.ArticleCategoryService.updateArticleCategory(
      id,
      req.payload as UpdateArticleCategoryDto
    );
  }

  @post("/")
  @options({
    description: "新建分类",
    notes: "返回分类",
    tags: ["api", "文章分类"],
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
    validate: {
      payload: CreateArticleCategorySchema,
    },
  })
  async create(req: hapi.Request): Promise<ArticleCategory> {
    const input = req.payload as CreateArticleCategoryDto;
    return this.ArticleCategoryService.createArticleCategory(input);
  }
}
