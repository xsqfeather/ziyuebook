import { CreateArticleDto } from "dtos";
import { GetListQuery, ListData } from "lib/types";
import { Article, ArticleModel } from "models";
import { Service } from "typedi";
import { BaseService } from "./base.service";

@Service()
export class ArticleService extends BaseService<Article> {
  public async getArticleList(
    input: GetListQuery<Article>
  ): Promise<ListData<Article>> {
    const { data, total } = await this.getListData<Article>(
      ArticleModel,
      input,
      ["title"]
    );
    return {
      data,
      total,
    };
  }

  public async createArticle(input: CreateArticleDto): Promise<Article> {
    const article = await ArticleModel.create(input);
    return article;
  }
}
