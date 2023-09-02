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
    const input: ChatCompletionRequestMessage[] = [
      {
        role: "user",
        content: `${content}, 请以更个人博主的角度重新阐述，加上一点吐槽和表情, 但是尽量保持信息的完整吧`,
      },
    ];
    let messages = await this.getContent(input);
    const newRewrite = messages.choices[0].message.content;
    input.push({
      role: "assistant",
      content: newRewrite,
    });
    input.push({
      role: "user",
      content: "给出对这篇文章SEO友好的标签吧,用逗号分隔下吧",
    });
    messages = await this.getContent(input);
    const tags = messages.choices[0].message.content;
    input.push({
      role: "assistant",
      content: tags,
    });
    input.push({
      role: "user",
      content: "我想要转发这篇到twitter上, 写个推文吧，95字数以内",
    });
    messages = await this.getContent(input);
    const twitterPost = messages.choices[0].message.content;
    input.push({
      role: "assistant",
      content: twitterPost,
    });
    input.push({
      role: "user",
      content: "为这篇文章起个更吸引人的标题吧",
    });
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
