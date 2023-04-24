import { Inject, Service } from "typedi";
import { CreateSessionDto } from "../dtos";
import { SessionModel } from "../models/session.model";
import { UserService } from "./user.service";
import Boom from "@hapi/boom";
import JWT from "jsonwebtoken";
import { getJwtSecret } from "../lib/config";
import { SessionExpiredJob } from "../jobs/session.expired.job";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { SessionLogJob } from "../jobs/session.log.job";

@Service()
export class SessionService {
  @Inject(() => UserService)
  userService!: UserService;

  @Inject(() => SessionExpiredJob)
  sessionExpiredJob!: SessionExpiredJob;

  @Inject(() => SessionLogJob)
  sessionLogJob!: SessionLogJob;

  public async create(input: CreateSessionDto) {
    const user = await this.userService.checkUserAuth(input);
    if (!user) {
      throw Boom.unauthorized("Invalid username or password");
    }

    const session = await SessionModel.create({
      userId: user.id,
      roles: user.roles,
      username: user.username,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const token = JWT.sign(
      {
        userId: user.id,
        username: user.username,
        roles: user.roles,
        id: session.id,
      },
      getJwtSecret(),
      {
        expiresIn: "30 days",
      }
    );

    this.sessionExpiredJob.start(session);
    this.sessionLogJob.start(session);

    return { token };
  }

  async validate(decoded: any, _request: Request, _h: ResponseToolkit) {
    const userSession = await SessionModel.findOne({ id: decoded.id });
    console.log({ userSession });

    const idRoles =
      userSession?.roles.map((role) => {
        return `${role}-${userSession?.userId}`;
      }) || [];

    if (userSession) {
      return {
        isValid: true,
        credentials: {
          ...decoded,
          scope: [...(userSession.roles || []), ...idRoles],
        },
      };
    } else {
      return { isValid: false };
    }
  }
}
