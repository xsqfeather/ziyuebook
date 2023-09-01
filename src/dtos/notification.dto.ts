import { Optional, Required, getSchema } from "joi-typescript-validator";

export class CreateNotificationDto {
  @Required()
  fromUserId: string;

  @Required()
  toUserId!: string;

  @Optional()
  username!: string;

  @Optional()
  userAvatar!: string;

  @Required()
  title!: {
    [lang: string]: string;
  };

  @Required()
  source!: string;

  @Required()
  sourceId!: string;

  @Optional()
  content?: string;
}

export const CreateNotificationSchema = getSchema(CreateNotificationDto).label(
  "CreateNotificationDto"
);

export class UpdateNotificationDto {
  @Optional()
  read?: boolean;
}

export const UpdateNotificationSchema = getSchema(UpdateNotificationDto).label(
  "UpdateNotificationDto"
);
