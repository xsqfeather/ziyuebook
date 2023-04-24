import {
  getTTBucket,
  getTTBucketRegion,
  getTTSecretId,
  getTTSecretKey,
} from "../lib/config";
import { Service } from "typedi";

import COS from "cos-nodejs-sdk-v5";

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
          res(data.Location);
        }
      );
    });
  }
}
