import { controller, get, options, post } from "hapi-decorators";
import { MController } from "../../lib";
import { Inject, Service } from "typedi";
import * as hapi from "@hapi/hapi";
import { OssService } from "../../services";
import {
  UploadImageDto,
  UploadImageSchema,
  UploadVideoSchema,
} from "../../dtos/uploads.dto";
import { UploadVideoDto } from "../../dtos/uploads.dto";

@Service()
@controller("/api/oss")
export class OssController extends MController {
  @Inject(() => OssService)
  ossService!: OssService;

  @get("/images/{imageName}")
  async showImage(request: hapi.Request, h: hapi.ResponseToolkit) {
    const { imageName } = request.params;
    const [cid, ext] = imageName.split(".");
    const stream = await this.ossService.showImage(cid);
    return h.response(stream).type("image/" + ext);
  }

  @post("/images")
  @post("/")
  @options({
    tags: ["api", "上传"],
    description: "上传图片",
    notes: "返回图片cid",
    auth: {
      strategy: "jwt",
      scope: ["admin", "user"],
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
    validate: {
      payload: UploadImageSchema,
      failAction: async (request, h, err) => {
        console.log(err);
        throw err;
      },
    },

    plugins: {
      "hapi-swagger": {
        payloadType: "form",
      },
    },
  })
  async uploadImage(request: hapi.Request, h: hapi.ResponseToolkit) {
    const { image } = request.payload as UploadImageDto;
    const result = await this.ossService.addImage(image._data);
    return result;
  }

  @get("/files/{cid}")
  getFile(_request: hapi.Request, h: hapi.ResponseToolkit) {
    return h.view("index.html");
  }

  @get("/videos/{cid}")
  async getVideo(request: hapi.Request, h: hapi.ResponseToolkit) {}

  @get("/videos/{cid}/stream")
  async getVideoPlay(request: hapi.Request, h: hapi.ResponseToolkit) {}

  @post("/videos")
  @post("/")
  @options({
    tags: ["api", "上传"],
    description: "上传视频",
    notes: "返回视频文件名",
    auth: {
      strategy: "jwt",
      scope: ["admin", "user"],
    },
    payload: {
      output: "stream",
      parse: true,
      maxBytes: 1024 * 1024 * 1024 * 3, //10G
      allow: "multipart/form-data",
      multipart: {
        output: "stream",
      },
    },
    validate: {
      payload: UploadVideoSchema,
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
      },
    },
  })
  async uploadVideo(request: hapi.Request, h: hapi.ResponseToolkit) {
    const { video } = request.payload as UploadVideoDto;
    const result = await this.ossService.addVideo(video._data);
    return result;
  }

  @post("/short_videos")
  @post("/")
  @options({
    tags: ["api", "上传"],
    description: "上传视频",
    notes: "返回视频文件名",
    auth: {
      strategy: "jwt",
      scope: ["admin", "user"],
    },
    payload: {
      output: "stream",
      parse: true,
      maxBytes: 1024 * 1024 * 10, //10m
      allow: "multipart/form-data",
      multipart: {
        output: "stream",
      },
    },
    validate: {
      payload: UploadVideoSchema,
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
      },
    },
  })
  async uploadShortVideo(request: hapi.Request, h: hapi.ResponseToolkit) {
    const { video } = request.payload as UploadVideoDto;
    const result = await this.ossService.addVideo(video._data);
    return result;
  }
}
