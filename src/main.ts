import { startApp } from "./lib";
import Container from "typedi";
import { SessionService } from "./services";

import {
  ArticleApiController,
  HomeController,
  ProductApiController,
  ProductCategoryApiController,
  SessionApiController,
  UserApiController,
  UploadApiController,
  AvPostApiController,
  ProductOnXianOnSaleApiController,
  ProductOffXianOffSaleApiController,
  ProductOnXianBannedApiController,
  SettingApiController,
  AvStarApiController,
  AvCategoryApiController,
  ArticleCategoryApiController,
  AvTagApiController,
  AvPostCommentApiController,
  ChatMsgApiController,
  GptChatApiController,
} from "./controllers";
import {
  UserAvPostCommentsController,
  UserGptChatCommentsController,
  UserGptChatsController,
  UserUserAvPostLikesController,
} from "./controllers/api/users";
import { GptChatCommentApiController } from "./controllers/api/gpt.chat.comment.api.controller";
import { UserUserGptChatLikesController } from "./controllers/api/users/user.gpt.chat.like";

startApp({
  apiControllers: [
    ArticleApiController,
    HomeController,
    SessionApiController,
    UserApiController,
    ProductApiController,
    ProductCategoryApiController,
    UploadApiController,
    AvPostApiController,
    AvStarApiController,
    ArticleCategoryApiController,
    ProductOnXianOnSaleApiController,
    ProductOffXianOffSaleApiController,
    ProductOnXianBannedApiController,
    SettingApiController,
    AvCategoryApiController,
    AvTagApiController,
    AvPostCommentApiController,
    UserAvPostCommentsController,
    UserUserAvPostLikesController,
    ChatMsgApiController,
    GptChatApiController,
    UserGptChatsController,
    UserGptChatCommentsController,
    GptChatCommentApiController,
    UserUserGptChatLikesController,
  ],
  pageControllers: [],
  jwtValidation: Container.get(SessionService).validate,
});
