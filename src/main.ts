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
  ],
  pageControllers: [],
  jwtValidation: Container.get(SessionService).validate,
});
