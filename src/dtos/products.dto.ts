import Joi from "joi";
import { CustomSchema, getSchema } from "joi-typescript-validator";

export class ImportXianExcelDto {
  @CustomSchema(Joi.any().meta({ swaggerType: "file" }).required())
  file: any;
}
export const ImportXianExcelSchema = getSchema(ImportXianExcelDto);
