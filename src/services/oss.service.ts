import { Service } from "typedi";
import Boom from "@hapi/boom";

const cidSizeCache: { [x: string]: number } = {};

@Service()
export class OssService {
  getIpfsClient = async () => {
    const { create } = await import("kubo-rpc-client");
    const client = create("/ip4/127.0.0.1/tcp/5001");
    return client;
  };

  async addFile(buffer: Buffer) {
    const client = await this.getIpfsClient();
    const result = await client.add(buffer, {
      progress: (progress: any) => console.log(progress),
    });
    return result;
  }

  async showVideo(cid: string) {
    const all = (await import("it-all")).default;
    const client = await this.getIpfsClient();
    if (!cidSizeCache[cid]) {
      try {
        for await (const file of client.ls(cid)) {
          if (file.size > (cidSizeCache[cid] || 0)) {
            cidSizeCache[cid] = file.size;
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
    const { concat: uint8ArrayConcat } = await import("uint8arrays/concat");

    const data = uint8ArrayConcat(await all(client.cat(cid)));
    const buffer = Buffer.from(data);
    const { fileTypeFromBuffer } = require("file-type");
    const fileType = await fileTypeFromBuffer(buffer);
    console.log(fileType, typeof fileType.mime);
    if (!fileType.mime?.includes("video")) {
      throw Boom.badRequest("不是shiping");
    }
    console.log("size", cidSizeCache[cid]);
    return { buffer, size: cidSizeCache[cid], mime: fileType.mime };
  }

  async showVideoRange(cid: string, offset: number, length: number) {
    const all = (await import("it-all")).default;
    const client = await this.getIpfsClient();
    if (!cidSizeCache[cid]) {
      cidSizeCache[cid] = 0;
      try {
        for await (const file of client.ls(cid)) {
          cidSizeCache[cid] += file.size || 0;
        }
      } catch (error) {
        console.error(error);
      }
    }
    try {
      const { concat: uint8ArrayConcat } = await import("uint8arrays/concat");
      const data = uint8ArrayConcat(
        await all(
          await client.cat(cid, {
            offset,
            length,
          })
        )
      );
      const buffer = Buffer.from(data);
      return { buffer, size: cidSizeCache[cid] };
    } catch (error) {
      console.error({ error });
      throw error;
    }
  }

  async addImage(buffer: Buffer) {
    const { fileTypeFromBuffer } = require("file-type");
    const fileType = await fileTypeFromBuffer(buffer);
    console.log(fileType, typeof fileType.mime);
    if (!fileType.mime?.includes("image")) {
      throw Boom.badRequest("不是图片");
    }
    const result = await this.addFile(buffer);
    return { imageName: result.path + "." + fileType.ext };
  }

  async addVideo(buffer: Buffer) {
    const { fileTypeFromBuffer } = require("file-type");
    let fileType = null;
    try {
      fileType = await fileTypeFromBuffer(buffer);
      console.log(fileType, typeof fileType.mime);
      if (!fileType.mime?.includes("video")) {
        throw Boom.badRequest("不是视频");
      }
    } catch (error) {
      throw Boom.badRequest("视频格式有问题或者视频已经损坏");
    }

    const result = await this.addFile(buffer);
    return { videoName: result.path + "." + fileType?.ext };
  }

  async showImage(cid: string) {
    const all = (await import("it-all")).default;
    const client = await this.getIpfsClient();
    const { concat: uint8ArrayConcat } = await import("uint8arrays/concat");
    const data = uint8ArrayConcat(await all(await client.cat(cid)));
    const buffer = Buffer.from(data);
    const { fileTypeFromBuffer } = require("file-type");
    const fileType = await fileTypeFromBuffer(buffer);
    console.log(fileType, typeof fileType.mime);
    if (!fileType.mime?.includes("image")) {
      throw Boom.badRequest("不是图片");
    }
    return buffer;
  }
}
