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
} from "./controllers";
import {
  UserAvPostCommentsController,
  UserUserAvPostLikesController,
} from "./controllers/api/users";

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
  ],
  pageControllers: [],
  jwtValidation: Container.get(SessionService).validate,
});
