import { controller, get, options, post, put } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { UserService } from "../../services";
import { User } from "../../models";
import { Request } from "@hapi/hapi";
import Joi from "joi";
import { UploadService } from "../../services/upload.service";

@Service()
@controller("/api/uploads")
export class UploadApiController extends MController {
  @Inject(() => UploadService)
  uploadService!: UploadService;

  @post("/")
  @options({
    tags: ["api", "上传文件"],
    description: "测试",
    notes: "测试",
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
    payload: {
      output: "stream",
      parse: true,
      maxBytes: 1024 * 1024 * 100, //100m
      allow: "multipart/form-data",
      multipart: {
        output: "stream",
      },
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
      },
    },
  })
  async upload(req: Request) {
    const { file } = req.payload as any;
    const result = await this.uploadService.upload(file._data);
    return result;
  }
}
