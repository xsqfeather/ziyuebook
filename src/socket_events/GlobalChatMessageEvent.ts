import { Service } from "typedi";
import { SocketListener } from "../lib/SocketListener";
import { Server, Socket } from "socket.io";
import { globalEmitter } from "../lib/utils/globalEmitter";

@Service()
export class GlobalChatMessageEvent extends SocketListener {
  afterTokenJoin = async (socket: Socket) => {
    console.log("GlobalChatMessageEvent", "join-global-chat");
  };

  listen(io: Server, socket: Socket) {
    const token = socket.handshake.auth?.token;
    socket.on("join-global-chat", (userInfo) => {
      console.log("listen", "join-global-chat", userInfo);
    });
    globalEmitter.on("new-message", (message) => {
      io.to(token).emit("new-message", message);
    });
  }
}
