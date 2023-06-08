import { Service } from "typedi";
import { SESSION_JOB } from "./namespaces";
import { AgendaService } from "../lib/types";
import { Session, SessionModel } from "../models/session.model";
import Agenda, { Job } from "agenda";
import { getAgendaMongoURI } from "../lib/config";

@Service()
export class SessionExpiredJob implements AgendaService<Session> {
  eventName = "expired";

  agenda = new Agenda({
    db: { address: getAgendaMongoURI(), collection: "sessionsExpiredJobs" },
  });
  constructor() {
    this.agenda.define(SESSION_JOB + this.eventName, this.handle);
  }
  handle = async (job: Job<Session>) => {
    const session = job.attrs.data;
    await SessionModel.deleteOne({ id: session.id });
  };
  start = async (session?: Session) => {
    await this.agenda.start();
    if (session?.expiresAt) {
      this.agenda.schedule(
        session?.expiresAt,
        SESSION_JOB + this.eventName,
        session
      );
    }
  };
}
