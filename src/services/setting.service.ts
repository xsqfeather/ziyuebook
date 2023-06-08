import { Setting, SettingModel } from "../models";
import { Service } from "typedi";

@Service()
export class SettingService {
  async get(key: string): Promise<string | undefined> {
    const settingItem = await SettingModel.findOne({ key });
    return settingItem?.value;
  }

  async put(key: string, value: string): Promise<Setting | null> {
    return SettingModel.findOneAndUpdate(
      { key },
      {
        $set: {
          value,
        },
      },
      {
        upsert: true,
      }
    );
  }
}
