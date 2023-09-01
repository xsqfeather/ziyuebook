import { controller, get, options, post, put } from "hapi-decorators";
import { Inject, Service } from "typedi";
import {
  ListData,
  ListQueryDto,
  ListQuerySchema,
  MController,
} from "../../lib";
import { UserService } from "../../services";
import { User } from "../../models";
import * as hapi from "@hapi/hapi";
import Joi from "joi";
import { CreateUserDto, CreateUserSchema } from "../../dtos";

@Service()
@controller("/api/users")
export class UserApiController extends MController {
  @Inject(() => UserService)
  userService!: UserService;

  @get("/")
  @options({
    tags: ["api", "用户"],
    description: "查询用户列表",
    notes: "返回用户列表",
    validate: {
      query: ListQuerySchema,
    },
    auth: {
      strategy: "jwt",
      scope: ["user", "admin"],
    },
  })
  async list(req: hapi.Request): Promise<ListData<User>> {
    const query = req.query as ListQueryDto;
    let listQuery = this.parseListQuery<User>(query);
    listQuery = JSON.parse(JSON.stringify(listQuery));
    const userList = await this.userService.getUserList({
      ...listQuery,
      filter: {
        ...listQuery.filter,
        roles: {
          $in: ["user"],
        },
        id: {
          $ne: req.auth?.credentials?.userId,
        },
      },
    });
    const safeUserList = userList.data?.map((user) => {
      user.password = undefined;
      return user;
    });
    return {
      data: safeUserList,
      total: userList.total,
    };
  }

  @post("/")
  @options({
    tags: ["api", "用户相关"],
    description: "创建注册一个用户",
    notes: "返回一个用户基本信息",
    validate: {
      payload: CreateUserSchema,
    },
  })
  async createUser(req: hapi.Request): Promise<Partial<User>> {
    return this.userService.createUser(req.payload as CreateUserDto);
  }

  @get("/{id}")
  @options({
    tags: ["api", "查询用户详情"],
    description: "测试",
    notes: "测试",
    validate: {
      params: Joi.object({
        id: Joi.string().required().description("用户ID"),
      }),
    },
  })
  detail(req: hapi.Request): Promise<User> {
    return this.userService.getUserById(req.params.id);
  }

  @put("/{id}")
  @options({
    tags: ["api", "更新用户信息"],
    description: "测试",
    notes: "测试",
  })
  async update(req: hapi.Request): Promise<User> {
    return this.userService.updateUser(req.params.id, req.payload);
  }
}
