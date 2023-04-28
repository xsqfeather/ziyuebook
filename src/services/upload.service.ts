import {
  getTTBucket,
  getTTBucketRegion,
  getTTSecretId,
  getTTSecretKey,
} from "../lib/config";
import { Service } from "typedi";
import { fileTypeFromBuffer } from "file-type";

import COS from "cos-nodejs-sdk-v5";
import { nanoid } from "nanoid";

@Service()
export class UploadService {
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
}
