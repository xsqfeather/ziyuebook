import { controller, get, options, post } from "hapi-decorators";
import { MController } from "../../lib";
import { Inject, Service } from "typedi";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { CreateSessionDto } from "../../dtos";
import { SessionService } from "../../services";
import { showNoAccessPage } from "../../lib/utils/showNoAccessPage";

@Service()
@controller("/")
export class HomeController extends MController {
  @Inject(() => SessionService)
  sessionService!: SessionService;

  @get("/")
  @options({
    auth: {
      strategy: "dbCookie",
      scope: ["user"],
    },
    ext: {
      onPreResponse: {
        method: showNoAccessPage,
      },
    },
  })
  index(_request: Request, h: ResponseToolkit) {
    return h.view("index.html");
  }

  @get("/login")
  about(_request: Request, h: ResponseToolkit) {
    return h.view("login.html");
  }

  @post("/login")
  async login(request: Request, h: ResponseToolkit) {
    try {
      const input = request.payload as CreateSessionDto;
      const session = await this.sessionService.create(input);
      h.state("token", session.token, {
        ttl: 1000 * 60 * 60 * 24 * 7,
      });
      return h.view("login-success.html");
    } catch (error: any) {
      console.log({ error });
      return h.view("login.html", { error });
    }
  }

  @get("/write")
  register(request: any, h: any) {
    console.log("request.state", request.state);
    return h.view("write.html");
  }

  @get("/hot")
  article(request: any, h: any) {
    console.log("request.state", request.state);
    return h.view("hot.html");
  }
}
