import { Job, JobAttributesData } from "agenda";

import { ReqRef, ServerRegisterPluginObject, ServerRoute } from "@hapi/hapi";

export interface Module {
  routes: ServerRoute<ReqRef> | ServerRoute<ReqRef>[];
  service: any;
  controller: any;
  plugins: ServerRegisterPluginObject<any>[];
}

export interface AgendaService<T extends JobAttributesData> {
  handle: (job: Job<T>, done?: () => void) => void;
  start: (data?: T) => void;
}

export interface ListData<T> {
  data: T[];
  total: number;
}

export interface GetListQuery<T> {
  filter: { [x in keyof T]: any };
  sort: { [x in keyof T]: -1 | 1 };
  skip: number;
  limit: number;
}
