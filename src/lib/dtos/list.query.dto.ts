import Joi from "joi";
import { CustomSchema, Optional, getSchema } from "joi-typescript-validator";

export class ListQueryDto {
  @CustomSchema(Joi.string().optional().description("查询条件").default("{}"))
  filter: string = "{}";

  @Optional()
  page: string = "1";

  @Optional()
  perPage: string = "10";

  @Optional()
  sort: string = '{"createdAt":"DESC"}';
}

export const ListQuerySchema = getSchema(ListQueryDto).label("ListQueryDto");
