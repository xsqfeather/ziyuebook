import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { Service } from "typedi";
import { getOpenAIApiKey, getOpenAIOrgId } from "../config";

import axios from "axios";

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
        model: "gpt-3.5-turbo",
        messages: inputMessages,
      },
      {
        responseType: "json",
      }
    );
    return chatCompletion.data;
  }

  async getHercaiMessage(input: string) {
    try {
      const url = `https://hercai.onrender.com/v2/hercai?question=${encodeURI(
        input
      )}`;
      const { data } = await axios.get(url);
      console.log({ data });
    } catch (error) {
      console.error(error);
    }
  }

  async rewrite(
    content: string,
    imagePosition: {
      [x: number]: {
        imageSrc: string;
        imageAlt: string;
        imageTitle: string;
      };
    },
    locale = "en"
  ) {
    const initMsg = `${content},//n 请以更个人博主的角度使用简体中文吧重新阐述,有大量吐槽和emoji表情, 在尽量保持原有的信息完整的基础上有趣接地气。`;
    // await this.getHercaiMessage(initMsg);
    // throw new Error("not implemented");
    let input: ChatCompletionRequestMessage[] = [
      {
        role: "user",
        content: initMsg,
      },
    ];
    let messages = await this.getContent(input);
    const newRewrite = messages.choices[0].message.content;

    input = [
      {
        role: "user",
        content: `${newRewrite}  给出对这篇文章SEO友好的标签吧,用逗号分隔下吧`,
      },
    ];

    messages = await this.getContent(input);
    const tags = messages.choices[0].message.content;
    input = [
      {
        role: "user",
        content: `${newRewrite}  我想要转发这篇到twitter上, 写个简中的推文吧，95字数以内`,
      },
    ];

    messages = await this.getContent(input);
    const twitterPost = messages.choices[0].message.content;
    input = [
      {
        role: "user",
        content: `${newRewrite}  为这篇文章起个更吸引人的标题吧`,
      },
    ];

    messages = await this.getContent(input);
    const title = messages.choices[0].message.content;
    const contentParagraphs = newRewrite.split("\n");
    //insert images to markdown paragraphs
    for (const key in imagePosition) {
      if (Object.prototype.hasOwnProperty.call(imagePosition, key)) {
        const image = imagePosition[key];
        const imageMarkdown = `![${image.imageAlt}](${image.imageSrc})`;
        contentParagraphs.splice(parseInt(key), 0, imageMarkdown);
      }
    }
    //merge
    content = contentParagraphs.join("\n");
    return { content: newRewrite, title, tags, twitterPost };
  }
}
