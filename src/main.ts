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
  AvActorApiController,
  ProductOnXianOnSaleApiController,
  ProductOffXianOffSaleApiController,
  ProductOnXianBannedApiController,
} from "./controllers";

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
    AvActorApiController,
    ProductOnXianOnSaleApiController,
    ProductOffXianOffSaleApiController,
    ProductOnXianBannedApiController,
  ],
  pageControllers: [],
  jwtValidation: Container.get(SessionService).validate,
});
const server = require("http")
  .createServer()
  .listen(8080, () => {
    console.log("gun server started at port 8080");
  });
const gun = GUN({ web: server });
