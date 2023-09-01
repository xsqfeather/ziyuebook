import { Server, Socket } from "socket.io";

export interface JoinSocketInput {
  socket: Socket;
  room: string;
  params: Object;
  io: Server;
}
