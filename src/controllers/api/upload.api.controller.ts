import { controller, get, options, patch, post } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import * as hapi from "@hapi/hapi";
import { UploadService } from "../../services/upload.service";
import { ReadStream, createWriteStream } from "fs";
import { getStaticsOriginUrl } from "../../lib/config";
const { nanoid } = require("nanoid");

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
      maxBytes: 1024 * 1024 * 50, //50m
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
  async upload(req: hapi.Request) {
    const { file, filename }: { file: ReadStream; filename: string } =
      req.payload as any;
    const id = nanoid();
    const newFilename = `${id}.${filename.split(".").pop()}`;
    await this.uploadService.uploadS3(file, newFilename);
    return {
      filename: newFilename,
      origin: getStaticsOriginUrl(),
    };
  }

  @get("/check-upload/{md5}/{size}")
  @options({
    tags: ["api", "检查上传组件"],
    description: "测试",
    notes: "测试",
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async checkUpload(req: hapi.Request) {
    const { md5, size } = req.params;
    const result = await this.uploadService.checkUploadFile(md5, size);
    return result;
  }

  @patch("/merge-chunks")
  @options({
    tags: ["api", "检查上传组件"],
    description: "测试",
    notes: "测试",
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
  })
  async mergeChunks(req: hapi.Request) {
    const { md5, filename, length } = req.payload as any;
    const result = await this.uploadService.mergeChunks(md5, filename, length);
    return result;
  }

  @post("/upload-chunk")
  @options({
    tags: ["api", "检查上传分片"],
    description: "分片",
    notes: "分片",

    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
    payload: {
      output: "stream",
      parse: true,
      maxBytes: 1024 * 1024 * 5, //5m
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
  async uploadChunk(req: hapi.Request) {
    const { md5, filename, chunkIndex, file } = req.payload as any;

    const writeStream = createWriteStream(
      `${process.cwd()}/uploads/${md5}-${chunkIndex}`
    );
    await file.pipe(writeStream);
    const result = await this.uploadService.updateChunk(
      md5,
      chunkIndex,
      filename
    );
    return result;
  }
}
