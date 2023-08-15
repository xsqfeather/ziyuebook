import { Optional, Required, getSchema } from "joi-typescript-validator";

export class CreateAvPostDto {
  @Required()
  public abyssCode!: string;

  @Required()
  public title!: string;

  @Optional()
  public cover!: {
    name: string;
    origin: string;
  };

  @Optional()
  public categoryId!: string;

  @Optional()
  public description!: string;

  @Optional()
  public introduction!: string;

  @Optional()
  public locale!: string;

  @Optional()
  public previewVideo!: string;

  @Optional()
  public video?: {
    name: string;
    origin: string;
  };

  @Optional()
  public tagIds?: string[];

  @Optional()
  public images?: {
    name: string;
    origin: string;
  }[];

  @Optional()
  publishDate?: Date;

  @Optional()
  public starIds?: string[];

  @Optional()
  public designator?: string;

  @Optional()
  public isFemaleFriendly?: boolean;
}

export const CreateAvPostSchema =
  getSchema(CreateAvPostDto).label("CreateAvPostDto");

export class UpdateAvPostDto {
  @Required()
  public title!: string;

  @Required()
  public abyssCode!: string;

  @Optional()
  public cover!: {
    name: string;
    origin: string;
  };

  @Optional()
  public categoryId!: string;

  @Optional()
  public description!: string;

  @Optional()
  public introduction!: string;

  @Optional()
  public locale!: string;

  @Optional()
  public previewVideo!: string;

  @Optional()
  public video?: {
    name: string;
    origin: string;
  };

  @Optional()
  public tagIds?: string[];

  @Optional()
  publishDate?: Date;

  @Optional()
  public starIds?: string[];

  @Optional()
  public images?: { name: string; origin: string }[];

  @Optional()
  public designator?: string;

  @Optional()
  public hot?: number;

  @Optional()
  public isFemaleFriendly?: boolean;
}

export const UpdateAvPostDtoSchema =
  getSchema(UpdateAvPostDto).label("UpdateAvPostDto");
