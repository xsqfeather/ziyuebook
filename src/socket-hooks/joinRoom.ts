import { Socket } from "socket.io";

export function checkJoinable(socket: Socket, room: string) {
  return true;
}

export function afterJoin(socket: Socket, room: string) {
  if (room.includes("gpt-chat-")) {
    socket.on("message", (message) => {
      socket.to(room).emit("message", message);
    });
    return;
  }
  return true;
}
