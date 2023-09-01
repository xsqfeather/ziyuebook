import { Job } from "agenda";
import { Session, SessionModel } from "./models";

export default [
  {
    name: "remove expired sessions",
    handler: async (job: Job<Session>) => {
      console.log("remove expired sessions", job.attrs.data);
      const session = job.attrs.data;
      await SessionModel.deleteOne({ id: session.id });
    },
  },
];
