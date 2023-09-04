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
    console.log("old article================", article);
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
      article.washed = true;
      article.status = 2;
      if (article.twitterPost.length > 90) {
        article.twitterPost = article.twitterPost.slice(0, 90) + "...";
      }
      await article.save();
      //shorten twitter post to 90

      await TwitterPostTaskModel.create({
        queryWord: article.tags[0],
        post: `${article.twitterPost} https://wolove.life/${article.locale}/articles/${article.id}`,
      });

      console.log("washed article", article);
    } catch (error) {
      article.status = 0;
      await article.save();
      console.log("error", error);
      continue;
      // break;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 * 60 * 2 + Math.random() * 10000)
    );
  }
};

washArticles();
