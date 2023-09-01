import { Socket } from "socket.io";
import { Service } from "typedi";

@Service()
export class SocketListener {
  afterTokenJoin?: any;

  onJoin(socket: Socket) {}

  listen(io: any, socket: Socket) {}
}
