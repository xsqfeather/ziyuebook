import { Server } from "socket.io";
import { getMongoURI } from "./lib/config";
import mongoose from "mongoose";
import registerSocketEvent from "./registerSocketEvent";

const init = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(getMongoURI());
  const io = new Server({
    /* options */
  });

  registerSocketEvent(io);

  console.log("listening on port", 8080);

  io.listen(8080);
};

init();
