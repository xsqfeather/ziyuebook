import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { Service } from "typedi";
import { getOpenAIApiKey, getOpenAIOrgId } from "../config";

const configuration = new Configuration({
  apiKey: getOpenAIApiKey(),
  organization: getOpenAIOrgId(),
});
const openai = new OpenAIApi(configuration);

@Service()
export class OpenAIService {
  async getStream(inputMessages: ChatCompletionRequestMessage[]) {
    const chatCompletion = await openai.createChatCompletion(
      {
        model: "gpt-4",
        messages: inputMessages,
        stream: true,
      },
      {
        responseType: "stream",
      }
    );
    return chatCompletion.data as any;
  }

  async getContent(inputMessages: ChatCompletionRequestMessage[]) {
    const chatCompletion = await openai.createChatCompletion(
      {
        model: "gpt-4",
        messages: inputMessages,
      },
      {
        responseType: "json",
      }
    );
    return chatCompletion.data;
  }
}
