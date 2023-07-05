import {
  getOriginUrl,
  getTTBucket,
  getTTBucketRegion,
  getTTSecretId,
  getTTSecretKey,
} from "../lib/config";
import { Inject, Service } from "typedi";

import COS from "cos-nodejs-sdk-v5";
import { getLevelValue, setLevelValue } from "../utils/level";
import {
  WriteStream,
  createReadStream,
  createWriteStream,
  existsSync,
  unlinkSync,
} from "fs";
import { HLSJob } from "../jobs";

const CHUNK_SIZE = 2 * 1024 * 1024;

@Service()
export class UploadService {
  @Inject(() => HLSJob)
  hlsJob!: HLSJob;

  async uploadTTImage(body: Buffer, Key: string) {
    return new Promise((res: any, rej: any) => {
      const cos = new COS({
        SecretId: getTTSecretId(),
        SecretKey: getTTSecretKey(),
      });

      cos.putObject(
        {
          Bucket: getTTBucket(),
          Region: getTTBucketRegion(),
          StorageClass: "STANDARD",
          Body: body,
          Key,
          ACL: "public-read",
          onProgress: function (progressData: any) {
            // console.log(JSON.stringify(progressData));
          },
        },
        function (err: any, data: any) {
          if (err) {
            rej(err);
          }
          res(data?.Location);
        }
      );
    });
  }

  async upload(file: Buffer) {
    const { nanoid } = require("nanoid");
    const { fileTypeFromBuffer } = require("file-type");

    const originId = nanoid();

    const fileType = await fileTypeFromBuffer(file);

    const ossUrl = await this.uploadTTImage(
      file,
      originId + "." + fileType.ext
    );

    return {
      url: "https://" + ossUrl,
    };
  }

  async checkUploadFile(md5: string, length: number) {
    const value = await getLevelValue(md5);
    let currentProgress = 0;
    for (let index = 0; index < length; index++) {
      const chunk = await getLevelValue(md5 + "-" + String(index + 1));
      currentProgress = index;
      if (!chunk) {
        break;
      }
    }
    return {
      filename: value,
      currentProgress,
    };
  }

  async mergeChunks(md5: string, filename: string, length: number) {
    const newFilename = `${md5}.${filename.split(".")[1]}`;
    const files = [];
    const dest = `${process.cwd()}/uploads/${newFilename}`;
    const exist = existsSync(dest);
    if (exist) {
      // this.hlsJob.start({ filename: newFilename });
      return {
        filename: newFilename,
        origin: getOriginUrl(),
      };
    }
    for (let index = 0; index < length; index++) {
      const file = `${process.cwd()}/uploads/${md5}-${index + 1}`;
      files.push(file);
    }
    const pipeStream = (filePath: string, writeStream: WriteStream) => {
      return new Promise<void>((resolve) => {
        const readStream = createReadStream(filePath);
        readStream.on("end", () => {
          //每一个切片读取完毕后就将其删除
          unlinkSync(filePath);
          resolve();
        });
        readStream.pipe(writeStream);
      });
    };

    const chunkSize = CHUNK_SIZE;

    const pipes = files.map((file, index) => {
      return pipeStream(
        file,
        createWriteStream(dest, {
          start: index * chunkSize,
          end: (index + 1) * chunkSize,
        } as any)
      );
    });
    await Promise.all(pipes);

    await setLevelValue(md5, newFilename);

    this.hlsJob.start({ filename: newFilename });

    return {
      filename: newFilename,
      origin: getOriginUrl(),
    };
  }

  async updateChunk(md5: string, chunkIndex: number, filename: string) {
    await setLevelValue(md5 + "-" + String(chunkIndex), filename);
    return {
      path: "",
    };
  }
}
