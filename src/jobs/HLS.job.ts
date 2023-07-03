import { Inject, Service } from "typedi";
import { AgendaService } from "../lib/types";
import Agenda, { Job } from "agenda";
import { getAgendaMongoURI } from "../lib/config";
import { OssService } from "../services";

@Service()
export class HLSJob implements AgendaService<{ filename: string }> {
  @Inject(() => OssService)
  ossService!: OssService;

  agenda = new Agenda({
    db: { address: getAgendaMongoURI(), collection: "sessionLogJobs" },
  });
  constructor() {
    this.agenda.define(HLSJob.name, this.handle);
  }
  handle = async (job: Job<{ filename: string }>) => {
    const session = job.attrs.data;
    console.log("开始生成HLS2", session.filename);
    await this.ossService.generateHls(session.filename);
  };
  async start(session?: { filename: string }) {
    console.log("开始生成HLS1", session?.filename);
    await this.agenda.start();
    this.agenda.now(HLSJob.name, session || {});
  }
}
