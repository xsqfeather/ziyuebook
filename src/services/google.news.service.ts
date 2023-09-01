import { Service } from "typedi";
import sgMail from "@sendgrid/mail";
import { getSendGridApiKey } from "../lib/config";

import googleNewsScraper from "google-news-scraper";
import axios from "axios";

sgMail.setApiKey(getSendGridApiKey());

@Service()
export class GoogleNewsService {
  async getArticles() {
    console.log("getArticles");

    const options = {
      method: "GET",
      url: "https://www.msn.cn/zh-cn/news",
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}
