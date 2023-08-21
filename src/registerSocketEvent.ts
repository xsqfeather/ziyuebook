import { Server } from "socket.io";
import { afterJoin, checkJoinable } from "./socket-hooks";
import { globalEmitter } from "./lib/utils/globalEmitter";

export default function registerSocketEvent(io: Server) {
  io.on("connection", (socket) => {
    globalEmitter.on("message", (room, message) => {
      io.to(room).emit("message", message);
    });
    socket.on("join", (room) => {
      console.log("join", room);
      const joinable = checkJoinable(socket, room);
      if (!joinable) {
        socket.emit("joinFailed", room);
        return;
      }
      socket.join(room);
      afterJoin(socket, room || "default");
      socket.on("message", (room, message) => {
        socket.to(room).emit("message", message);
      });
      socket.on("leave", (room) => {
        socket.leave(room);
        socket.emit("left", room);
      });
      socket.emit("joined", room);
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
    });
    socket.on("error", (err) => {
      console.log("error", err);
    });
  });
}
