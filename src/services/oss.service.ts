import { Service } from "typedi";
import Boom from "@hapi/boom";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
} from "fs";

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

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

  getGunCid() {}

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

  async showVideo(filename: string) {
    const filepath = `${process.cwd()}/uploads/${filename}`;
    const uploadExist = existsSync(filepath);
    if (!uploadExist) {
      throw Boom.notFound("文件不存在");
    }

    const stream = createReadStream(filepath);
    return stream;
  }

  async getVideoChunkStream(filename: string, offset: number, length: number) {
    const filepath = `${process.cwd()}/uploads/${filename}`;
    const uploadExist = existsSync(filepath);
    if (!uploadExist) {
      throw Boom.notFound("文件不存在");
    }
    const stats = statSync(filepath);
    const size = stats.size;
    const stream = createReadStream(filepath, {
      start: offset,
      end: offset + length - 1,
    });
    return {
      stream,
      size,
    };
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
    const result = await this.addFile(videoPath);
    return { videoName: result.path + "." + "mp4" };
  }

  async showImage(filename: string) {
    const filepath = `${process.cwd()}/uploads/${filename}`;
    const uploadExist = existsSync(filepath);
    if (!uploadExist) {
      throw Boom.notFound("文件不存在");
    }
    const stream = createReadStream(filepath);
    return stream;
  }

  async generateHls(filename: string) {
    try {
      ffmpeg.setFfmpegPath(ffmpegInstaller.path);
      const filepath = `${process.cwd()}/uploads/${filename}`;
      const outputDir = `${process.cwd()}/hls/${filename}`;
      const outputDirExist = existsSync(outputDir);
      if (!outputDirExist) {
        mkdirSync(outputDir);
      }
      ffmpeg(filepath)
        .addOptions([
          "-profile:v baseline",
          "-level 3.0",
          "-start_number 0",
          "-hls_time 10",
          "-hls_list_size 0",
          "-f hls",
        ])
        .output(`${outputDir}/index.m3u8`)
        .on("end", () => {
          console.log("end");
        })
        .run();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
