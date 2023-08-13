import { Inject, Service } from "typedi";
import { EventEmitter } from "node:events";
import { GptChatService } from "../services";
import { ChatCompletionRequestMessage } from "openai";
import { globalEmitter } from "../lib/utils/globalEmitter";

class MyEmitter extends EventEmitter {}
@Service()
export class SubGptMsg {
  private emitter = new MyEmitter();

  @Inject(() => GptChatService)
  private readonly gptChatService!: GptChatService;

  constructor() {
    this.emitter.on(SubGptMsg.name, this.handle);
  }

  private handle = async (params: {
    gptMsgId: string;
    messages: ChatCompletionRequestMessage[];
  }) => {
    try {
      const { gptMsgId, messages } = params;
      console.log("handle", { gptMsgId, messages });
      globalEmitter.emit("start-gpt-stream", 1);
      const data = await this.gptChatService.getGPTStream(messages);
      data.on("data", (data: any) => {
        try {
          const strS = data.toString().split("data: ");
          for (let index = 0; index < strS.length; index++) {
            let strToParse = strS[index];
            if (strToParse.includes("[DONE]")) {
              console.log("结束了");
              globalEmitter.emit("stop-gpt-stream", 1);
              break;
            }
            const firstP = strToParse.indexOf("{");
            const lastP = strToParse.lastIndexOf("}");
            strToParse = strToParse.substring(firstP - 1, lastP + 1);

            if (
              !strToParse.includes("[DONE]") &&
              strToParse.length > 0 &&
              strToParse.includes("delta")
            ) {
              const streamRlt = JSON.parse(strToParse);
              console.log("最终的单词", streamRlt.choices[0].delta.content);
              globalEmitter.emit("get-gpt-stream", {
                message: streamRlt.choices[0].delta.content,
                gptMsgId,
              });
            }
          }
        } catch (error) {
          console.log("不能解析的", data.toString());
          console.log(error);
        }
      });
    } catch (error: any) {
      error.message = `获取消息失败，${error.message}`;
      console.log({ error });
    }
  };

  public async trigger(
    gptMsgId: string,
    messages: ChatCompletionRequestMessage[]
  ): Promise<any> {
    this.emitter.emit(SubGptMsg.name, { gptMsgId, messages });
  }
}
