import "reflect-metadata";
import Hapi from "@hapi/hapi";
import mongoose from "mongoose";
import plugins from "./plugins";
import Container from "typedi";
import Handlebars from "handlebars";
import { getJwtSecret, getMongoURI, serverConfig } from "./config";
import { DbSessionAuth } from "./plugins/dbSessionAuth";
import { AvCategoryModel } from "../models";
import fs from "fs";

export const startApp = async (startAppConfig: {
  pageControllers: any[];
  apiControllers: any[];
  jwtValidation: any;
}) => {
  const { pageControllers, apiControllers, jwtValidation } = startAppConfig;
  try {
    const uploadExist = fs.existsSync(`${process.cwd()}/uploads`);
    if (!uploadExist) {
      fs.mkdirSync(`${process.cwd()}/uploads`);
    }
    mongoose.set("strictQuery", true);
    await mongoose.connect(getMongoURI());
    const defaultAvCategory = await AvCategoryModel.findOne({
      isDefault: true,
    });
    if (!defaultAvCategory) {
      await AvCategoryModel.create({
        name: "默认分类",
        langs: {
          zh: "默认分类",
          en: "Default Category",
          "zh-TW": "默認分類",
          "zh-Hk": "默認分類",
        },
        description: "默认分类",
        isDefault: true,
      });
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

  const server = Hapi.server(serverConfig);

  await server.register([
    ...plugins,
    {
      plugin: DbSessionAuth,
      options: {
        validate: jwtValidation,
      },
    },
  ]);

  server.auth.strategy("jwt", "jwt", {
    key: getJwtSecret(),
    validate: jwtValidation,
  });

  let routes: any = [];

  for (let index = 0; index < apiControllers?.length; index++) {
    const controller = apiControllers[index];
    routes = [
      ...routes,
      ...((Container.get(controller as any) as any)?.routes() || []),
    ];
  }

  for (let index = 0; index < pageControllers.length; index++) {
    const controller = pageControllers[index];
    routes = [
      ...routes,
      ...(Container.get(controller as any) as any)?.routes(),
    ];
  }
  server.views({
    engines: {
      html: Handlebars,
    },
    relativeTo: process.cwd(),
    path: "templates",
    helpersPath: "templates/helpers",
    partialsPath: "templates/partials",
    layoutPath: "templates/layouts",
    layout: "layout",
  });
  server.route([
    ...routes,
    {
      method: "GET",
      path: "/static/{param*}",
      handler: {
        directory: {
          path: ".",
          redirectToSlash: true,
        },
      },
    },
    {
      method: "GET",
      path: "/{any*}",
      handler: (request, h) => {
        return h.view("404").code(404);
      },
    },
  ]);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
