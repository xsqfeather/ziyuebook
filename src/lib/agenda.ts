import Agenda from "agenda";
import { getAgendaMongoURI } from "./config";
import AgendaJobs from "../AgendaJobs";

export const agenda = new Agenda({
  db: { address: getAgendaMongoURI(), collection: "sessionLogJobs" },
});

AgendaJobs.forEach((job) => {
  agenda.define(job.name, job.handler);
});

if (AgendaJobs.length) {
  agenda.start(); // Returns a promise, which should be handled appropriately
}
