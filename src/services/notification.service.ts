import { CreateNotificationDto, UpdateNotificationDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { Notification, NotificationModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
import { globalEmitter } from "../lib/utils/globalEmitter";
@Service()
export class NotificationService extends BaseService<Notification> {
  async updateNotification(id: string, input: UpdateNotificationDto) {
    try {
      const notification = await NotificationModel.findOne({ id });
      if (!notification) {
        throw Boom.notFound("该标签不存在");
      }
      if (input.read) {
        notification.read = input.read;
      }
      await notification.save();
      globalEmitter.emit("message", {
        room: `/users/${notification.toUserId}/notifications`,
        message: { hasNew: true },
      });
      return notification;
    } catch (error) {
      console.error(error);
    }
  }
  public async getOne(id: string) {
    const avTag = await NotificationModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该演员不存在");
    }
    return avTag;
  }
  public async getNotificationList(
    input: GetListQuery<Notification>
  ): Promise<ListData<Notification>> {
    const { data, total } = await this.getListData<Notification>(
      NotificationModel,
      input,
      ["name"]
    );
    return {
      data,
      total,
    };
  }

  public async createNotification(
    input: CreateNotificationDto
  ): Promise<Notification> {
    const notification = await NotificationModel.create(input);
    globalEmitter.emit("message", {
      room: `/users/${notification.toUserId}/notifications`,
      message: { hasNew: true },
    });
    return notification;
  }

  public async deleteNotification(id: string): Promise<Notification | null> {
    const notification = await NotificationModel.findOneAndDelete({ id });
    if (!notification) {
      throw Boom.notFound("Star Not Found");
    }
    return notification;
  }
  public async deleteNotifications(checkedIds: string[]) {
    await NotificationModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }
}
