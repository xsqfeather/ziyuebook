import { CreateUserApplyDto, UpdateUserApplyDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import {
  NotificationModel,
  UserApply,
  UserApplyModel,
  UserModel,
} from "../models";
import { Inject, Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
import { FriendshipService, NotificationService } from ".";
import { globalEmitter } from "../lib/utils/globalEmitter";
@Service()
export class UserApplyService extends BaseService<UserApply> {
  @Inject(() => NotificationService)
  notificationService: NotificationService;

  @Inject(() => FriendshipService)
  friendshipService: FriendshipService;

  async updateUserApply(id: string, input: UpdateUserApplyDto) {
    try {
      const userApply = await UserApplyModel.findOne({ id });
      if (!userApply) {
        throw Boom.notFound("该请求不存在");
      }
      if (input.status) {
        userApply.status = input.status;
      }
      if (input.read) {
        userApply.read = input.read;
      }

      await userApply.save();
      if (input.read === true) {
        await NotificationModel.updateMany(
          {
            source: "user-applies",
            toUserId: userApply.toUserId,
            fromUserId: userApply.fromUserId,
          },
          { read: true }
        );
        globalEmitter.emit("message", {
          room: `/users/${userApply.toUserId}/notifications`,
          message: { hasNew: true },
        });
      }

      if (input.status === "accepted") {
        const friendship = await this.friendshipService.createFriendship({
          friendIds: [userApply.fromUserId, userApply.toUserId],
        });
        this.notificationService.createNotification({
          sourceId: friendship.id,
          source: "friendships",
          title: {
            zh: `已接受您的好友请求`,
            en: `Accepted your friend request`,
            zhTW: `已接受您的好友請求`,
          },
          content: userApply.applyNote,
          fromUserId: userApply.toUserId,
          username: userApply.username,
          toUserId: userApply.fromUserId,
          userAvatar: userApply.userAvatar,
        });
      }
      if (input.status === "rejected") {
        this.notificationService.createNotification({
          sourceId: userApply.id,
          source: "user-applies",
          title: {
            zh: `已拒绝您的好友请求`,
            en: `Rejected your friend request`,
            zhTW: `已拒絕您的好友請求`,
          },
          content: userApply.applyNote,
          fromUserId: userApply.toUserId,
          username: userApply.username,
          toUserId: userApply.fromUserId,
          userAvatar: userApply.userAvatar,
        });
      }

      return userApply;
    } catch (error) {
      console.error(error);
    }
  }
  public async getOne(id: string) {
    const avTag = await UserApplyModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该演员不存在");
    }
    return avTag;
  }
  public async getUserApplyList(
    input: GetListQuery<UserApply>
  ): Promise<ListData<UserApply>> {
    const { data, total } = await this.getListData<UserApply>(
      UserApplyModel,
      input,
      ["name"]
    );
    return {
      data,
      total,
    };
  }

  public async createUserApply(input: CreateUserApplyDto): Promise<UserApply> {
    console.log(input);
    if (input.fromUserId === input.toUserId) {
      throw Boom.badRequest("不能申请自己");
    }

    const user = await UserModel.findOne({ id: input.fromUserId });
    if (!user) {
      throw Boom.badRequest("用户不存在");
    }
    const userApply = await UserApplyModel.create({
      ...input,
      username: user?.nickname || user?.username,
      userAvatar: user?.avatar,
    });
    try {
      await this.notificationService.createNotification({
        sourceId: userApply.id,
        source: "user-applies",
        title: {
          zh: `请求加您为好友`,
          en: `Request to add you as a friend`,
          zhTW: `請求加您為好友`,
        },
        content: userApply.applyNote,
        fromUserId: userApply.fromUserId,
        username: user?.nickname || user?.username,
        toUserId: userApply.toUserId,
        userAvatar: user.avatar,
      });
    } catch (error) {
      console.error(error);
    }

    return userApply;
  }

  public async deleteUserApply(id: string): Promise<UserApply | null> {
    const star = await UserApplyModel.findOneAndDelete({ id });
    if (!star) {
      throw Boom.notFound("Star Not Found");
    }
    return star;
  }
  public async deleteUserApplies(checkedIds: string[]) {
    await UserApplyModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }
}
