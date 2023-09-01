import { CreateFriendshipDto, UpdateFriendshipDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { Friendship, FriendshipModel } from "../models";
import { Inject, Service } from "typedi";
import { BaseService } from "./base.service";
import Boom from "@hapi/boom";
import { NotificationService } from ".";
@Service()
export class FriendshipService extends BaseService<Friendship> {
  @Inject(() => NotificationService)
  notificationService: NotificationService;

  async updateFriendship(id: string, input: UpdateFriendshipDto) {
    try {
      const avTag = await FriendshipModel.findOne({ id });
      if (!avTag) {
        throw Boom.notFound("该标签不存在");
      }
      const updatedFriendship = await FriendshipModel.findOneAndUpdate(
        { id },
        {
          $set: {
            ...input,
          },
        }
      );

      return updatedFriendship;
    } catch (error) {
      console.error(error);
    }
  }
  public async getOne(id: string) {
    const avTag = await FriendshipModel.findOne({ id });
    if (!avTag) {
      throw Boom.notFound("该演员不存在");
    }
    return avTag;
  }
  public async getFriendshipList(
    input: GetListQuery<Friendship>
  ): Promise<ListData<Friendship>> {
    const { data, total } = await this.getListData<Friendship>(
      FriendshipModel,
      input,
      ["name"]
    );
    return {
      data,
      total,
    };
  }

  public async createFriendship(
    input: CreateFriendshipDto
  ): Promise<Friendship> {
    let friendship = await FriendshipModel.findOne({
      friendIds: { $all: input.friendIds },
    });
    if (friendship) {
      console.log("已经是好友了", friendship);
      return friendship;
    }
    friendship = await FriendshipModel.create(input);

    return friendship;
  }

  public async deleteFriendship(id: string): Promise<Friendship | null> {
    const star = await FriendshipModel.findOneAndDelete({ id });
    if (!star) {
      throw Boom.notFound("Star Not Found");
    }
    return star;
  }
  public async deleteFriendships(checkedIds: string[]) {
    await FriendshipModel.deleteMany({ id: { $in: checkedIds } });
    return checkedIds;
  }
}
