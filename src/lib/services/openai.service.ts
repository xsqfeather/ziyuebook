import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { Service } from "typedi";
import { getOpenAIApiKey, getOpenAIOrgId } from "../config";

import axios from "axios";

const langInput: any = {
  zh: [
    "请以更个人博主的角度使用简体中文吧重新阐述,有大量吐槽和emoji表情, 在尽量保持原有的信息完整的基础上有趣接地气。",
    "给出对这篇文章SEO友好的标签吧,用逗号分隔下吧",
    "我想要转发这篇到推特上, 写个简体中文的推文吧，务必95字数以内，仅给正文",
    "为这篇文章起个更吸引人的标题吧，使用简体中文",
  ],
  en: [
    "Please restate it from the perspective of a more personal blogger, with a lot of grouch and emoji expressions, and interesting and down-to-earth on the basis of trying to keep the original information intact.",
    "Give me some SEO friendly tags for this article, separated by commas",
    "I want to forward this to twitter, write a tweet in English, be sure to be within 95 words, only give the body",
    "Give this article a more attractive title",
  ],
  zhTW: [
    "請以更個人博主的角度使用繁體中文吧重新闡述,有大量吐槽和emoji表情, 在盡量保持原有的信息完整的基礎上有趣接地氣。",
    "給出對這篇文章SEO友好的標籤吧,用逗號分隔下吧",
    "我想要轉發這篇到推特上, 寫個繁體中文的推文吧，務必95字數以內，僅給正文",
    "為這篇文章起個更吸引人的標題吧",
  ],
};

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
    const initMsg = `${content}, ${langInput[locale][0]}`;
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
        content: `${newRewrite} ${langInput[locale][1]}`,
      },
    ];

    messages = await this.getContent(input);
    const tags = messages.choices[0].message.content;
    input = [
      {
        role: "user",
        content: `${newRewrite} ${langInput[locale][2]}`,
      },
    ];

    messages = await this.getContent(input);
    const twitterPost = messages.choices[0].message.content;
    input = [
      {
        role: "user",
        content: `${newRewrite} ${langInput[locale][3]}`,
      },
    ];

    messages = await this.getContent(input);
    const title = messages.choices[0].message.content;
    let contentParagraphs = newRewrite.split("\n");
    //insert images to markdown paragraphs
    for (const key in imagePosition) {
      if (Object.prototype.hasOwnProperty.call(imagePosition, key)) {
        const image = imagePosition[key];
        const imageMarkdown = `\n ![${image.imageAlt}](${image.imageSrc})`;
        contentParagraphs.splice(parseInt(key) + 1, 0, imageMarkdown);
      }
    }
    //merge
    const newContent = contentParagraphs.join("\n");
    return { content: newContent, title, tags, twitterPost };
  }
}
