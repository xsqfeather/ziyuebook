import { CreateArticleDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { Article, ArticleModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";

@Service()
export class ArticleService extends BaseService<Article> {
  public async getArticleList(
    input: GetListQuery<Article>
  ): Promise<ListData<Article>> {
    ArticleModel.find({}, { title: 1 });
    const { data, total } = await this.getListData<Article>(
      ArticleModel,
      input,
      ["title"],
      {
        title: 1,
        cover: 1,
        publishTime: 1,
        id: 1,
      }
    );
    return {
      data,
      total,
    };
  }

  public async getOne(id: string) {
    const article = await ArticleModel.findOne({ id });
    if (!article) {
      throw Boom.notFound("该文章不存在");
    }
    if (!article.washed) {
      throw Boom.notFound("该文章不存在");
    }
    return article;
  }

  public async createArticle(input: CreateArticleDto): Promise<Article> {
    const article = await ArticleModel.create(input);
    return article;
  }
}
