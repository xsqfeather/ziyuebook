import { Inject, Service } from "typedi";
import { UserModel } from "../models";
import { getDefaultRoot, getDefaultRootPass } from "../lib/config";
import { PasswordService } from "../lib/services";
import Boom from "@hapi/boom";

import { AvatarGenerator } from "random-avatar-generator";

const generator = new AvatarGenerator();

@Service()
export class UserService {
  @Inject(() => PasswordService)
  passwordService!: PasswordService;

  public async checkUserAuth({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    //check normal user
    const userExist = await UserModel.findOne({ username });

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
        userExist.password
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
    if (user.settings?.kongUsername !== data.kongUsername) {
      //如果更新了孔网的用户名，开始持续更新价格
    }
    if (user.settings?.xianAppKey !== data.xianAppKey) {
      //如果更新了闲管家的appkey，同步商品信息
    }
    return await this.getUserById(id);
  }
}
