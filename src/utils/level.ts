import level from "level-party";

const levelDB = level(process.cwd() + "/level_cache", {
  valueEncoding: "json",
});

export async function getLevelValue(key: string) {
  return new Promise((resolve, reject) => {
    levelDB.get(key, (err: { notFound: any }, value: unknown) => {
      if (err) {
        if (err.notFound) {
          resolve(undefined);
        } else {
          reject(err);
        }
      } else {
        resolve(value);
      }
    });
  });
}

export async function setLevelValue(key: any, value: any) {
  return new Promise<void>((resolve, reject) => {
    levelDB.put(key, value, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
