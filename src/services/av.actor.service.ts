import { CreateAvActorDto } from "../dtos";
import { GetListQuery, ListData } from "../lib/types";
import { AvActor, AvActorModel } from "../models";
import { Service } from "typedi";
import { BaseService } from "./base.service";

@Service()
export class AvActorService extends BaseService<AvActor> {
  public async getAvActorList(
    input: GetListQuery<AvActor>
  ): Promise<ListData<AvActor>> {
    const { data, total } = await this.getListData<AvActor>(
      AvActorModel,
      input,
      ["title"]
    );
    return {
      data,
      total,
    };
  }

  public async createAvActor(input: CreateAvActorDto): Promise<AvActor> {
    const article = await AvActorModel.create(input);
    return article;
  }
}
