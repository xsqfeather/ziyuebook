import level from "level-party";
import { Service } from "typedi";

const db = level("level_cache", { valueEncoding: "json" });

@Service()
export class LevelCacheService {
  put(key: string, value: any) {
    return new Promise((resolve, reject) => {
      db.put(key, value, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }
  get(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      db.get(key, (err: { notFound: any }, value: string | null) => {
        if (err) {
          if (err.notFound) {
            resolve(null);
          } else {
            reject(err);
          }
        } else {
          resolve(value);
        }
      });
    });
  }
}
