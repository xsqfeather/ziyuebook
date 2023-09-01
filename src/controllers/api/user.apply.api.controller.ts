import { controller, get, options, post, put, route } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { ListData } from "../../lib/types";
import { UserApply } from "../../models";
import { UserApplyService } from "../../services";
import * as hapi from "@hapi/hapi";
import {
  CreateUserApplyDto,
  CreateUserApplySchema,
  UpdateUserApplyDto,
  UpdateUserApplySchema,
} from "../../dtos";
import { ListQueryDto, ListQuerySchema } from "../../lib/dtos/list.query.dto";
import Joi from "joi";

@Service()
@controller("/api/user-applies")
export class UserApplyApiController extends MController {
  @Inject(() => UserApplyService)
  userApplyService!: UserApplyService;

  @get("/")
  @options({
    tags: ["api", "用户申请"],
    description: "查询分类列表",
    notes: "返回用户申请",
    validate: {
      query: ListQuerySchema,
    },
  })
  async list(req: hapi.Request): Promise<ListData<UserApply>> {
    const query = req.query as ListQueryDto;
    const listQuery = this.parseListQuery<UserApply>(query);
    return this.userApplyService.getUserApplyList(listQuery);
  }

  @post("/")
  @options({
    description: "新建演员",
    notes: "返回演员数据",
    tags: ["api", "用户申请"],
    auth: {
      strategy: "jwt",
      scope: ["admin", "user"],
    },

    validate: {
      payload: CreateUserApplySchema,
      failAction: (req, h, err) => {
        console.error(err);
        throw err;
      },
    },
  })
  async create(req: hapi.Request): Promise<UserApply> {
    const input = req.payload as CreateUserApplyDto;
    return this.userApplyService.createUserApply(input);
  }

  @route("delete", "/{id}")
  @options({
    tags: ["api", "用户申请"],
    description: "删除分类",
    notes: "返回用户申请详细",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
    },
  })
  async deleteAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.userApplyService.deleteUserApply(id);
  }

  @get("/{id}")
  @options({
    tags: ["api", "用户申请详情"],
    description: "查询用户申请详情",
    notes: "测试",
    validate: {
      query: ListQuerySchema,
    },
  })
  async getOne(req: hapi.Request): Promise<UserApply> {
    return this.userApplyService.getOne(req.params.id as string);
  }

  @route("delete", "/")
  @options({
    description: "删除用户申请",
    notes: "返回用户申请数据",
    tags: ["api", "用户申请"],
    auth: {
      strategy: "jwt",
      scope: ["admin", "user"],
    },
  })
  async deleteMany(req: hapi.Request): Promise<string[]> {
    const ids = req.query.checkedIds;
    return this.userApplyService.deleteUserApplies(JSON.parse(ids));
  }

  @put("/{id}")
  @options({
    tags: ["api", "AV标签"],
    description: "更新分类详请",
    notes: "AV分类标签",
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      payload: UpdateUserApplySchema,
    },
  })
  async updateAvCategory(req: hapi.Request) {
    const id = req.params.id;
    return this.userApplyService.updateUserApply(
      id,
      req.payload as UpdateUserApplyDto
    );
  }
}
