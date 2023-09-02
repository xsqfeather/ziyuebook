import Container from "typedi";
import { TwitterService } from "./services/twitter.service";

Container.get(TwitterService).startAllTask();
