import { Service } from "typedi";
import { SocketListener } from "../lib/SocketListener";
import { Server, Socket } from "socket.io";
import { globalEmitter } from "../lib/utils/globalEmitter";

@Service()
export class GptChatEvent extends SocketListener {
  afterTokenJoin = async (socket: Socket) => {
    console.log("GptChatEvent");
  };

  listen(io: Server, socket: Socket) {
    const token = socket.handshake.auth?.token;
    socket.join(token);
    socket.on("join-global-chat", (userInfo) => {
      console.log("listen", "join-global-chat", userInfo);
    });
    const listenGptStream = (message: any) => {
      console.log("get-gpt-stream", message);
      io.to(token).emit(
        "get-gpt-stream",
        message,
        (err: any, responses: any) => {
          if (err) {
            // some clients did not acknowledge the event in the given delay
          } else {
            console.log(responses); // one response per client
          }
        }
      );
    };
    const startGptStream = (message: any) => {
      console.log("start-gpt-stream", message);
      io.to(token).emit("start-gpt-stream", message);
    };
    const stopGptStream = (message: any) => {
      console.log("stop-gpt-stream", message);
      io.to(token).emit("stop-gpt-stream", message);
    };

    globalEmitter.on("start-gpt-stream", startGptStream);
    globalEmitter.on("get-gpt-stream", listenGptStream);
    globalEmitter.on("stop-gpt-stream", stopGptStream);

    console.log("listen", "gpt-chat", token);

    socket.on("disconnect", () => {
      console.log("disconnect");
      socket.leave(token);
      globalEmitter.off("start-gpt-stream", startGptStream);
      globalEmitter.off("get-gpt-stream", listenGptStream);
      globalEmitter.off("stop-gpt-stream", stopGptStream);
    });
  }
}
