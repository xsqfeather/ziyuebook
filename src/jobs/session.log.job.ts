import { Service } from "typedi";
import { SESSION_JOB } from "./namespaces";
import { AgendaService } from "../lib/types";
import { Session } from "../models/session.model";
import Agenda, { Job } from "agenda";
import { getAgendaMongoURI } from "lib/config";

@Service()
export class SessionLogJob implements AgendaService<Session> {
  eventName = "logging";
  agenda = new Agenda({
    db: { address: getAgendaMongoURI(), collection: "sessionLogJobs" },
  });
  constructor() {
    this.agenda.define(SESSION_JOB + this.eventName, this.handle);
  }
  async handle(job: Job<Session>) {
    const session = job.attrs.data;
    console.log("用户已经登录啦", session.id);
  }
  async start(session: Session) {
    await this.agenda.start();
    this.agenda.now(SESSION_JOB + this.eventName, session);
  }
}
