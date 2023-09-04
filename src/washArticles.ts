import Container from "typedi";
import { OpenAIService } from "./lib/services/openai.service";
import { ArticleModel } from "./models";
import { TwitterPostTaskModel } from "./models/twitter.post.task.model";
import moment from "moment";

const locales = ["en", "zh", "zhTW"];

export const washArticles = async () => {
  const openaiService = Container.get(OpenAIService);
  for (let index = 0; index < Number.MAX_SAFE_INTEGER; index++) {
    console.log("start wash article", index);
    const article = await ArticleModel.findOne(
      { washed: false, status: 0, locale: locales[index % 3] },
      null,
      {
        sort: {
          createdAt: -1,
        },
      }
    );
    if (!article) {
      console.log("no article");
      return;
    }
    article.status = 1;
    article.updatedAt = new Date();
    article.publishTime = moment(article.publishTime || Date.now()).toDate();
    await article.save();
    const { content, imagePosition } = article;

    try {
      const {
        content: washedContent,
        title,
        twitterPost,
        tags,
      } = await openaiService.rewrite(
        content,
        imagePosition,
        article.locale || "en"
      );

      article.content = washedContent;
      article.tags = tags.split(",");
      article.tagsStr = tags;
      article.twitterPost = twitterPost;
      article.title = title;
      if (article.title.length > 90) {
        article.title = article.title.slice(0, 100) + "...";
      }
      article.washed = true;
      article.status = 2;
      article.publishTime = moment(article.publishTime || Date.now()).toDate();
      if (article.twitterPost.length > 90) {
        article.twitterPost = article.twitterPost.slice(0, 90) + "...";
      }
      await article.save();
      //shorten twitter post to 90

      await TwitterPostTaskModel.create({
        queryWord: article.tags[0],
        post: `${article.twitterPost} https://wolove.life/${article.locale}/articles/${article.id}`,
      });
    } catch (error) {
      article.status = 0;
      article.washed = false;
      article.publishTime = moment(article.publishTime || Date.now()).toDate();
      await article.save();
      console.log("error", error);
      continue;
      // break;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 * 60 + Math.random() * 10000)
    );
  }
};
