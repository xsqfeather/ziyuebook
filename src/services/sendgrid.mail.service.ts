import { Service } from "typedi";
import sgMail from "@sendgrid/mail";
import { getSendGridApiKey } from "../lib/config";

sgMail.setApiKey(getSendGridApiKey());

@Service()
export class SendGridMailService {
  async sendMail() {
    const msg = {
      to: "xsqfeather@gmail.com", // Change to your recipient
      from: "simontaosim@protonmail.com", // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
