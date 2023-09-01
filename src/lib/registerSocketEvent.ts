import { Server } from "socket.io";
import { globalEmitter } from "./utils/globalEmitter";
import { RoomRoute } from ".";

export function registerSocketEvent(io: Server, routes: RoomRoute[]) {
  const globalEmitterMessageHandler = (input: {
    room: string;
    message: any;
  }) => {
    const { room, message } = input;
    io.to(room).emit("message", message);
  };
  globalEmitter.on("message", globalEmitterMessageHandler);
  io.on("connection", (socket) => {
    const JoinHandler = (room: string) => {
      let isMatch = false;
      const params: any = {};
      for (let index = 0; index < routes.length; index++) {
        const route = routes[index];
        const routeName = route.name;

        const routeNameStr = routeName.split("/");
        const roomNameStr = room.split("/");

        for (let i = 0; i < routeNameStr.length; i++) {
          const isParams = routeNameStr[i].startsWith(":");
          if (isParams) {
            params[routeNameStr[i].slice(1)] = roomNameStr[i];
            isMatch = true;
          }
          if (routeNameStr[i] === roomNameStr[i] && !isParams) {
            isMatch = true;
          }
          if (routeNameStr[i] !== roomNameStr[i] && !isParams) {
            isMatch = false;
          }
        }
        if (routeNameStr.length !== roomNameStr.length) {
          isMatch = false;
        }
        if (isMatch) {
          if (route.checkJoinable) {
            const { joinable, reason } = route.checkJoinable({
              socket,
              room,
              params,
              io,
            });
            if (!joinable) {
              socket.emit("joinFail", reason);
              return;
            }
          }
          socket.join(room);
          route.handler({ socket, room, params, io });
          socket.emit("joined", room);
          if (route.receiver) {
            socket.on("message", (message) => {
              route.receiver({ socket, room, params, io, message });
            });
          }
          break;
        }
      }
      if (!isMatch) {
        socket.emit("joinFail", "no match");
      }
    };
    socket.on("join", JoinHandler);

    socket.on("disconnect", () => {
      console.log("disconnect");
      socket.off("join", JoinHandler);
    });
    socket.on("error", (err) => {
      console.log("error", err);
      socket.off("join", JoinHandler);
    });
  });
}
