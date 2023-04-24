import { Request, ResponseToolkit } from "@hapi/hapi";

export const showNoAccessPage = (request: Request, h: ResponseToolkit) => {
  if ((request.response as any)?.output?.statusCode === 403) {
    return h.view("no-access").takeover();
  }
  return h.continue;
};
