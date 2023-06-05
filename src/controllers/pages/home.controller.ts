import { controller, get, options, post } from "hapi-decorators";
import { MController } from "../../lib";
import { Inject, Service } from "typedi";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { CreateSessionDto } from "../../dtos";
import { OssService, SessionService } from "../../services";
import { showNoAccessPage } from "../../lib/utils/showNoAccessPage";

@Service()
@controller("/")
export class HomeController extends MController {
  @Inject(() => SessionService)
  sessionService!: SessionService;

  @Inject(() => OssService)
  ossService!: OssService;

  @get("/images/{imageName}")
  async showImage(request: Request, h: ResponseToolkit) {
    const { imageName } = request.params;
    const [cid, ext] = imageName.split(".");
    const stream = await this.ossService.showImage(cid);
    return h.response(stream).type("image/" + ext);
  }

  @get("/videos/{videoName}")
  async showVideo(request: Request, h: ResponseToolkit) {
    const { videoName } = request.params;
    const [cid, ext] = videoName.split(".");
    const { buffer } = await this.ossService.showVideo(cid);
    return h.response(buffer).type("video/" + ext);
  }

  @get("/videos/{cid}/play")
  async playVideo(request: Request, h: ResponseToolkit) {
    const { cid } = request.params;
    const range = request.headers.range;
    if (!range) {
      const { buffer, mime } = await this.ossService.showVideo(cid);
      return h.response(buffer).type(mime);
    }
    const CHUNK_SIZE = 2233467 * 10;
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);

    const { buffer, size } = await this.ossService.showVideoRange(
      cid,
      start || 0,
      CHUNK_SIZE
    );
    const end = parts[1] && parts[1] !== "" ? parseInt(parts[1], 10) : size - 1;
    return h
      .response(buffer)
      .type("video/mp4")
      .header("Content-Range", `bytes ${start}-${end}/${size}`)
      .header("Content-Length", CHUNK_SIZE.toString())
      .header("Accept-Ranges", "bytes")
      .code(206);
  }

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

  @get("/download/{cid}")
  download(_request: Request, h: ResponseToolkit) {
    return h.view("download.html");
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
