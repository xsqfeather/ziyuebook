import { controller, get, options, put } from "hapi-decorators";
import { Inject, Service } from "typedi";
import { MController } from "../../lib";
import { SettingService } from "../../services";
import * as hapi from "@hapi/hapi";
import Joi from "joi";
import { Setting } from "../../models";

@Service()
@controller("/api/settings")
export class SettingApiController extends MController {
  @Inject(() => SettingService)
  settingService!: SettingService;

  @get("/{key}/{locale}")
  @options({
    tags: ["api", "查询用户详情"],
    description: "测试",
    notes: "测试",
  })
  async getValue(req: hapi.Request): Promise<{ data: string }> {
    const key = req.params.key as string;
    const locale = req.params.locale as string;
    const value = await this.settingService.get(key + locale);
    return {
      data: value || "",
    };
  }

  @put("/{key}/{locale}")
  @options({
    tags: ["api", "查询用户详情"],
    description: "测试",
    notes: "测试",
  })
  async putValue(req: hapi.Request): Promise<Setting | null> {
    const key = req.params.key as string;
    const locale = req.params.locale as string;
    const data = req.payload as any;
    return this.settingService.put(key + locale, data.value);
  }
}
