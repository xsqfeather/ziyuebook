import { controller, get, options, post } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import * as hapi from "@hapi/hapi";
import { CreateSessionDto } from "../../dtos";
import { SessionService } from "../../services";

@Service()
@controller("/api/sessions")
export class SessionApiController extends MController {
  @Inject(() => SessionService)
  sessionService!: SessionService;

  @get("/")
  @options({
    tags: ["api", "查询当前登录会话"],
    description: "测试",
    notes: "测试",
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  list(request: hapi.Request, h: hapi.ResponseToolkit) {
    return h.response({}).code(200);
  }

  @post("/")
  @options({
    tags: ["api", "创建会话"],
    description: "测试",
    notes: "测试",
    auth: false,
  })
  async create(request: hapi.Request, h: hapi.ResponseToolkit) {
    const input = request.payload as CreateSessionDto;
    console.log({ input });
    const session = await this.sessionService.create(input);
    return session;
  }
}
