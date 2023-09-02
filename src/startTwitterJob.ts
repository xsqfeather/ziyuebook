import Container from "typedi";
import { TwitterService } from "./services/twitter.service";
import mongoose from "mongoose";
import { getMongoURI } from "./lib/config";

const startTwitterJob = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(getMongoURI());
  const twitterService = Container.get(TwitterService);
  await twitterService.startAllTask();
};

startTwitterJob();
