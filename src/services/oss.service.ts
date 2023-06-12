import { Service } from "typedi";
import Boom from "@hapi/boom";
import { readFileSync } from "fs";

const cidSizeCache: { [x: string]: number } = {};

@Service()
export class OssService {
  getIpfsClient = async () => {
    try {
      const { create } = await import("kubo-rpc-client");
      const client = create("/ip4/127.0.0.1/tcp/5001" as any);
      return client;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  async addFile(filepath: string) {
    console.log({ filepath });
    try {
      const client = await this.getIpfsClient();
      const result = await client.add(readFileSync(filepath), {
        progress: (progress: any) => console.log(progress),
      });
      console.log({ result });

      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
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

  async addImage(imagePath: string) {
    try {
      const { fileTypeFromFile } = await import("file-type");
      const fileType = await fileTypeFromFile(imagePath);
      if (!fileType?.mime?.includes("image")) {
        throw Boom.badRequest("不是图片");
      }
      const result = await this.addFile(imagePath);
      return { imageName: result.path + "." + fileType.ext };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addVideo(videoPath: string) {
    const { fileTypeFromFile } = await import("file-type");
    let fileType = null;
    try {
      fileType = await fileTypeFromFile(videoPath);
      console.log(fileType, typeof fileType.mime);
      if (!fileType.mime?.includes("video")) {
        throw Boom.badRequest("不是视频");
      }
    } catch (error) {
      throw Boom.badRequest("视频格式有问题或者视频已经损坏");
    }

    const result = await this.addFile(videoPath);
    return { videoName: result.path + "." + fileType?.ext };
  }

  async showImage(cid: string) {
    const all = (await import("it-all")).default;
    const client = await this.getIpfsClient();
    const { concat: uint8ArrayConcat } = await import("uint8arrays/concat");
    const data = uint8ArrayConcat(await all(await client.cat(cid)));
    const buffer = Buffer.from(data);
    const { fileTypeFromBuffer } = await import("file-type");
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType?.mime?.includes("image")) {
      throw Boom.badRequest("不是图片");
    }
    return buffer;
  }
}
