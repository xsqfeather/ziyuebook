import { Socket } from "socket.io";
import { Service } from "typedi";
import { getJwtSecret } from "../lib/config";
import jwt from "jsonwebtoken";
import { globalEmitter } from "./utils/globalEmitter";

@Service()
export class SocketListener {
  afterTokenJoin?: any;

  onJoin(socket: Socket) {}

  listen(io: any, socket: Socket) {}
}
