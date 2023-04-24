import { startApp } from "./lib";
import Container from "typedi";
import { SessionService } from "./services";
import {
  ArticleApiController,
  HomeController,
  ProductApiController,
  SessionApiController,
  UserApiController,
} from "./controllers";

startApp({
  apiControllers: [
    ArticleApiController,
    HomeController,
    SessionApiController,
    UserApiController,
    ProductApiController,
  ],
  pageControllers: [],
  jwtValidation: Container.get(SessionService).validate,
});
