import {
  Plugin,
  Server,
  ServerApplicationState,
  Request,
  ResponseToolkit,
} from "@hapi/hapi";

import JWT from "jsonwebtoken";

import Boom from "@hapi/boom";
import { getJwtSecret } from "../config";

const scheme = function (
  _server: Server<ServerApplicationState>,
  options: any
) {
  return {
    authenticate: async function (request: Request, h: ResponseToolkit) {
      try {
        const state = request.state;
        if (!state.token) {
          throw Boom.unauthorized("NO_SESSION");
        }
        const decoded = JWT.verify(state.token, getJwtSecret());

        const validRlt = await options.validate(decoded, request, h);

        return h.authenticated({
          credentials: validRlt.credentials,
        });
      } catch (error: any) {
        return h
          .response("You are being redirected...")
          .takeover()
          .redirect(
            "/login?status=" +
              error?.output?.payload?.statusCode +
              "&message=" +
              error?.output?.payload?.message
          );
      }
    },
  };
};

export const DbSessionAuth: Plugin<any> = {
  name: "db-session-auth",
  version: "1.0.0",
  register: (server, options) => {
    server.auth.scheme("dbCookie", scheme);
    server.auth.strategy("dbCookie", "dbCookie", options);
  },
};
