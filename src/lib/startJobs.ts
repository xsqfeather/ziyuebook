import mongoose from "mongoose";
import { getMongoURI } from "./config";
import Container from "typedi";

export const startJobs = async (startUpJobs: any[]) => {
  await mongoose.connect(getMongoURI());

  for (let index = 0; index < startUpJobs.length; index++) {
    const job: any = Container.get(startUpJobs[index]);
    await job?.start();
  }
};
