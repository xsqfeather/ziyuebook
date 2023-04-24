import { Server, ServerApplicationState } from "@hapi/hapi";
import Container from "typedi";
import { LevelCacheService } from "../services";
const levelCacheService = Container.get(LevelCacheService);

export const levelCachePlugin = {
  name: "level-cache",
  version: "1.0.0",
  register: async (server: Server<ServerApplicationState>) => {
    server.ext(
      "onRequest",
      async function (request, h) {
        try {
          if (request.method === "get" && request.path.startsWith("/api/")) {
            const { method, path, query } = request;
            const getCache = await levelCacheService.get(
              JSON.stringify({
                method,
                path,
                query,
              })
            );
            if (
              getCache &&
              typeof getCache === "string" &&
              getCache !== "null"
            ) {
              return h.response(JSON.parse(getCache)).takeover();
            }
            return h.continue;
          }
          return h.continue;
        } catch (error) {
          console.error(error);
          return h.continue;
        }
      },
      {
        after: "api-router",
      }
    );

    server.ext(
      "onPostResponse",
      async function (request, h) {
        if (request.method === "get" && request.path.startsWith("/api/")) {
          const getCache = await levelCacheService.get(
            JSON.stringify(request.query)
          );
          if (getCache && typeof getCache === "string" && getCache !== "null") {
            return h.continue;
          }
          const data = (h.request.response as any).source;

          if (data) {
            const { method, path, query } = request;
            await levelCacheService.put(
              JSON.stringify({
                method,
                path,
                query,
              }),
              JSON.stringify(data)
            );
            setTimeout(async () => {
              await levelCacheService.put(
                JSON.stringify({
                  method,
                  path,
                  query,
                }),
                "null"
              );
            }, 200);
          }
        }
        return h.continue;
      },
      {
        after: "api-router",
      }
    );
  },
};
