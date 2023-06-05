import Joi from "joi";
import { CustomSchema, getSchema } from "joi-typescript-validator";

export class UploadImageDto {
  @CustomSchema(Joi.any().meta({ swaggerType: "file" }).required())
  image: any;
}

export const UploadImageSchema =
  getSchema(UploadImageDto).label("UploadImageDto");

export class UploadVideoDto {
  @CustomSchema(Joi.any().meta({ swaggerType: "file" }).required())
  video: any;
}

export const UploadVideoSchema =
  getSchema(UploadVideoDto).label("UploadVideoDto");
