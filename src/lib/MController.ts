import { ReqRefDefaults, ServerRoute } from "@hapi/hapi";
import { Service } from "typedi";
import { ListQueryDto } from "./dtos/list.query.dto";
import { GetListQuery } from "./types";

@Service()
export class MController {
  target!: string;
  baseUrl!: string;
  routes(): ServerRoute<ReqRefDefaults>[] {
    return [];
  }

  parseListQuery<T>(listQuery: ListQueryDto): GetListQuery<T> {
    const { page = 1, perPage = 10 } = listQuery;

    let parsedSort: any = { createdAt: -1 };

    try {
      parsedSort = JSON.parse(
        typeof listQuery.sort === "string" ? listQuery.sort : "{}"
      ) || {
        createdAt: "DESC",
      };
      const keys = Object.keys(parsedSort);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const value = parsedSort[key];
        parsedSort = {
          [key]: value === "ASC" ? 1 : -1,
        };
      }
    } catch (error) {
      console.error(error);
      parsedSort = { createdAt: -1 };
    }

    let parseFilter: any = {};
    try {
      parseFilter = JSON.parse(listQuery.filter || "{}");
      const keys = Object.keys(parseFilter);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const value = parseFilter[key];
        if (Array.isArray(value)) {
          parseFilter[key] = {
            $in: value,
          };
          break;
        }
        parseFilter[key] = value;
      }
    } catch (error) {
      console.error(error);
      parseFilter = { createdAt: -1 };
    }

    return {
      filter: parseFilter,
      limit: +perPage,
      skip: +perPage * (+page - 1),
      sort: parsedSort,
    } as unknown as GetListQuery<T>;
  }
}
