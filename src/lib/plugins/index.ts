import * as HapiSwagger from "hapi-swagger";

import Inert from "@hapi/inert";
import Vision from "@hapi/vision";

import hapiAuthJwt2 from "hapi-auth-jwt2";

import Pack from "../../../package.json";
import { DbSessionAuth } from "./dbSessionAuth";

const swaggerOptions: HapiSwagger.RegisterOptions = {
  info: {
    title: "后端API",
    version: Pack.version,
  },
  securityDefinitions: {
    jwt: {
      type: "apiKey",
      name: "authorization",
      in: "header",
    },
  },
  security: [{ jwt: [] }],
  schemes: ["http", "https"],
  basePath: "/api",
  grouping: "tags",
};

export default [
  {
    plugin: hapiAuthJwt2,
    options: {},
  },
  {
    plugin: Inert,
    options: {},
  },

  {
    plugin: Vision,
    options: {},
  },

  {
    plugin: HapiSwagger,
    options: swaggerOptions,
  },
];
