import { Socket } from "socket.io";

export function beforeSend(socket: Socket, room: string, message: string) {
  return true;
}

export function afterSend(socket: Socket, room: string, message: string) {
  return true;
}

export function handleMessage(socket: Socket, room: string, message: string) {
  return true;
}
