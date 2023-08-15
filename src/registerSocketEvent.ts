import { Server } from "socket.io";
import { afterJoin, checkJoinable } from "./socket-hooks";

export default function registerSocketEvent(io: Server) {
  io.on("getList", (socket) => {
    socket.emit("getList", "hello world");
  });

  io.on("connection", (socket) => {
    socket.on("join", (room) => {
      const joinable = checkJoinable(socket, room);
      if (!joinable) {
        socket.emit("joinFailed", room);
        return;
      }
      socket.join(room);
      afterJoin(socket, room);
      socket.broadcast.emit("joined", room);
    });
    socket.on("leave", (room) => {
      socket.leave(room);
      socket.emit("left", room);
    });
    socket.on("message", (room, message) => {
      socket.to(room).emit("message", message);
    });
    socket.on("disconnect", () => {
      console.log("disconnect");
    });
    socket.on("error", (err) => {
      console.log("error", err);
    });
  });
}
