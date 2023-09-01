import { Server, Socket } from "socket.io";
import { RoomRoute } from "./lib";

export default [
  {
    name: "/",
    handler: (input: { socket: Socket; room: string }) => {
      console.log("default");
    },
  },
  {
    name: "/global-chat",
    handler: (input: { socket: Socket; room: string }) => {
      console.log("global-chat", input.socket.id);
    },
  },
  {
    name: "/gpt-msgs",
    handler: (input: { socket: Socket; room: string }) => {
      console.log("gpt-msgs");
    },
  },
  {
    name: "/users/:userId/notifications",
    handler: (input) => {
      console.log("开始处理， /users/{userId}/notifications", input.params);
    },
  },
  {
    name: "/gpt-msg/:id",
    handler: (input) => {
      console.log("handler gpt-msg/:id", input.params);
    },
    receiver: (input: {
      socket: Socket;
      room: string;
      params: { id: string };
      io: Server;
      message: any;
    }) => {
      console.log("receiver", "gpt-msg/:id", input.params);
    },
    checkJoinable: (input): { joinable: boolean; reason?: string } => {
      return {
        joinable: true,
      };
    },
  },
] as RoomRoute[];
