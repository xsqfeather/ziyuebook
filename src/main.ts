import { startApp } from "./lib";
import Container from "typedi";
import { SessionService } from "./services";
import Gun from "gun";

import http from "http";

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
  OssController,
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
    OssController,
    AvPostCommentApiController,
    UserAvPostCommentsController,
    UserUserAvPostLikesController,
  ],
  pageControllers: [],
  jwtValidation: Container.get(SessionService).validate,
});
const server = http
  .createServer((Gun as any).serve("../node_modules/gun"))
  .listen(8084, () => {
    console.log("gun server started at port 8084");
  });
Gun({ web: server });
