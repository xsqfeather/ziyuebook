import { Job, JobAttributesData } from "agenda";

import { ReqRef, ServerRegisterPluginObject, ServerRoute } from "@hapi/hapi";
import { Server, Socket } from "socket.io";

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

export type Rooms = "default" | "global-chat";

export interface RoomRouteMethodInput {
  socket: Socket;
  room: string;
  io?: Server;
  params?: { [x: string]: string };
}

export interface RoomRouteMethodInputWithMessage<T>
  extends RoomRouteMethodInput {
  message: T;
}

export type RoomRouteHandler = (input: RoomRouteMethodInput) => void;
export type RoomRouteMessageReceiver<T> = (
  input: RoomRouteMethodInputWithMessage<T>
) => void;

export type RoomRouteCheckJoinable = (input: RoomRouteMethodInput) => {
  joinable: boolean;
  reason?: string;
};

export interface RoomRoute {
  name: string;
  handler: RoomRouteHandler;
  receiver?: RoomRouteMessageReceiver<any>;
  checkJoinable?: RoomRouteCheckJoinable;
}
