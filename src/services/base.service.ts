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

    console.log({ searchFields });

    console.log({ filter });

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
    searchFields: string[] = []
  ) {
    const { filter, sort, skip, limit } = input;
    console.log({
      filter: JSON.stringify(this.parseFilter(filter, searchFields)),
    });
    const data = await model
      .find(this.parseFilter(filter, searchFields))
      .limit(limit)
      .skip(skip)
      .sort(sort);
    const total = await model.countDocuments(
      this.parseFilter(filter, searchFields)
    );
    return {
      data,
      total,
    } as ListData<T>;
  }
}
