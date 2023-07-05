import EventEmitter from "node:events";

class MyEmitter extends EventEmitter {}

export const globalEmitter = new MyEmitter();
