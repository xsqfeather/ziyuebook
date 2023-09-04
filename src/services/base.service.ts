import { ReturnModelType } from "@typegoose/typegoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";
import { GetListQuery, ListData } from "../lib/types";
import { Service } from "typedi";

@Service()
export class BaseService<T> {
  parseFilter(filter: any, searchFields: string[] = []) {
    const filterArray = Object.entries(filter)
      .filter(([key, value]) => {
        return key !== "q";
      })
      .map(([key, value]) => {
        return {
          [key]: value,
        };
      });

    if ((filter as any).q && searchFields.length > 0) {
      filterArray.push({
        $or: searchFields.map((field) => {
          return {
            [field]: {
              $regex: (filter as any).q,
              $options: "i",
            },
          };
        }),
      });
    }

    const finalFilter: any =
      filterArray.length > 0 ? { $and: filterArray as any } : {};

    return finalFilter;
  }
  async getListData<T>(
    model: ReturnModelType<any, BeAnObject>,
    input: GetListQuery<T>,
    searchFields: string[] = [],
    projection: object | null = null
  ) {
    const { filter, sort, skip, limit } = input;

    const paredFilter = this.parseFilter(filter, searchFields);
    const data = await model
      .find(paredFilter, projection)
      .limit(limit)
      .skip(skip)
      .sort(sort);
    const total = await model.countDocuments(paredFilter);
    return {
      data,
      total,
    } as ListData<T>;
  }
}
