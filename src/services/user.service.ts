import { Inject, Service } from "typedi";
import { User, UserModel } from "../models";
import { getDefaultRoot, getDefaultRootPass } from "../lib/config";
import { PasswordService } from "../lib/services";
import Boom from "@hapi/boom";

import { AvatarGenerator } from "random-avatar-generator";
import { CreateUserDto } from "../dtos";
import { BaseService } from "./base.service";
import { GetListQuery, ListData } from "../lib";

const generator = new AvatarGenerator();

@Service()
export class UserService extends BaseService<User> {
  @Inject(() => PasswordService)
  passwordService!: PasswordService;

  public async getUserList(input: GetListQuery<User>): Promise<ListData<User>> {
    const { data, total } = await this.getListData<User>(UserModel, input, [
      "title",
      "bookData.isbn",
      "category",
    ]);
    return {
      data,
      total,
    };
  }

  public async checkUserAuth({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    const userExist = await UserModel.findOne({
      $or: [{ username }, { email: username }],
    });

    if (username === getDefaultRoot() && !userExist) {
      let user = new UserModel();
      user.username = username;
      if (password === getDefaultRootPass()) {
        user.password = this.passwordService.generateHash(password);
        user.roles = ["admin"];
        user.avatar = generator.generateRandomAvatar();
        const newUser = await user.save();
        return newUser;
      } else {
        return null;
      }
    }

    if (userExist) {
      const isMatch = this.passwordService.checkHash(
        password,
        userExist.password || ""
      );
      if (isMatch) {
        return userExist;
      }
    }
    return null;
  }

  public async getUserById(id: string) {
    const user = await UserModel.findOne({ id: id });
    if (!user) {
      throw Boom.notFound("User not found");
    }
    const showUser = user.toObject();
    showUser.password = undefined;
    return showUser;
  }

  public async updateUser(id: string, data: any) {
    const user = await UserModel.findOne({ id });
    if (!user) {
      throw Boom.notFound("User not found");
    }
    await UserModel.updateOne({ id }, data);

    return await this.getUserById(id);
  }

  public async createUser(input: CreateUserDto) {
    if (!input.terms) {
      throw Boom.badRequest("请同意用户协议");
    }
    let existUser = await UserModel.findOne({ username: input.username });
    if (existUser) {
      throw Boom.badRequest("用户名已存在");
    }
    existUser = await UserModel.findOne({ email: input.email });
    if (existUser) {
      throw Boom.badRequest("邮箱已存在");
    }
    existUser = await UserModel.findOne({ nickname: input.nickname });
    if (existUser) {
      throw Boom.badRequest("昵称已存在");
    }
    const user = new UserModel();
    user.username = input.username;
    user.password = this.passwordService.generateHash(input.password);
    user.roles = ["user"];
    user.email = input.email;
    user.nickname = input.nickname;
    user.avatar = generator.generateRandomAvatar();
    const newUser = await user.save();
    newUser.password = undefined;
    return newUser;
  }
}
