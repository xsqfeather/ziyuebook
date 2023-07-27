import Joi from "joi";
import { CustomSchema, Required, getSchema } from "joi-typescript-validator";

export class CreateUserDto {
  @CustomSchema(
    Joi.string()
      .regex(/^[a-zA-Z0-9_-]{3,16}$/)
      .required()
      .messages({
        "string.pattern.base": "用户名必须是3-16位的字母数字下划线",
      })
      .example("username")
      .description("用户名")
  )
  public username!: string;

  @CustomSchema(
    Joi.string()
      .regex(/^\S+@\S+$/)
      .required()
      .messages({
        "string.pattern.base": "邮箱格式不正确",
      })
      .example("email@email.com")
      .description("邮箱")
  )
  public email!: string;

  @CustomSchema(
    Joi.string()
      .regex(/^\S{2,16}$/)
      .required()
      .messages({
        "string.pattern.base": "昵称必须是2-16位的字母数字下划线",
      })
      .example("nickname")
      .description("昵称")
  )
  public nickname!: string;

  @Required()
  public terms!: boolean;

  @CustomSchema(
    Joi.string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/)
      .required()
      .messages({
        "string.pattern.base": "密码必须是8-16位的字母数字组合",
      })
      .example("password")
      .description("密码")
  )
  public password!: string;

  @CustomSchema(
    Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "两次密码不一致",
      })
      .example("password")
      .description("重复密码")
  )
  public repeatPassword!: string;
}

export const CreateUserSchema = getSchema(CreateUserDto).label("CreateUserDto");

export class UpdateUserDto {
  public nickname!: string;

  public avatar!: string;

  public password!: string;

  public repeatPassword!: string;
}
