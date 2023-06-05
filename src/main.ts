import { startApp } from "./lib";
import Container from "typedi";
import { SessionService } from "./services";
import GUN from "gun";

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
import { UserAvPostCommentsController } from "./controllers/api/users";

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
  ],
  pageControllers: [],
  jwtValidation: Container.get(SessionService).validate,
});
const server = require("http")
  .createServer()
  .listen(8084, () => {
    console.log("gun server started at port 8080");
  });
const gun = GUN({ web: server });
