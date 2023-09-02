import Container from "typedi";
import mongoose from "mongoose";
import { getMongoURI } from "./lib/config";
import { OpenAIService } from "./lib/services/openai.service";
import { ArticleModel } from "./models";
import { TwitterPostTaskModel } from "./models/twitter.post.task.model";

const washArticles = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(getMongoURI());
  const openaiService = Container.get(OpenAIService);
  for (let index = 0; index < Number.MAX_SAFE_INTEGER; index++) {
    console.log("start wash article");
    const article = await ArticleModel.findOne(
      { washed: false, status: 0 },
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
    await article.save();
    const { content, imagePosition } = article;

    try {
      const {
        content: washedContent,
        title,
        twitterPost,
        tags,
      } = await openaiService.rewrite(content, imagePosition);

      console.log("washedContent", washedContent);

      article.content = washedContent;
      article.tags = tags.split(",");
      article.twitterPost = twitterPost;
      article.title = title;
      article.washed = true;
      article.status = 2;
      await article.save();
      await TwitterPostTaskModel.create({
        queryWord: article.tags[0],
        post: `${article.twitterPost} https://wolove.life/articles/${article.id}`,
      });

      console.log("washed article", article.content);
    } catch (error) {
      article.status = 0;
      await article.save();
      console.log("error", error);
      continue;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 100)
    );
  }
};

washArticles();
