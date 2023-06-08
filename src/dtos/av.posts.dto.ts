import { Optional, Required, getSchema } from "joi-typescript-validator";

export class CreateAvPostDto {
  @Required()
  public title!: string;

  @Optional()
  public cover!: string;

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

  @Required()
  public videoName!: string;

  @Optional()
  public tagIds?: string[];

  @Optional()
  public images?: string[];

  @Optional()
  publishDate?: Date;

  @Optional()
  public starIds?: string[];

  @Optional()
  public designator?: string;
}

export const CreateAvPostSchema =
  getSchema(CreateAvPostDto).label("CreateAvPostDto");

export class UpdateAvPostDto {
  @Required()
  public title!: string;

  @Optional()
  public cover!: string;

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

  @Required()
  public videoName!: string;

  @Optional()
  public tagIds?: string[];

  @Optional()
  publishDate?: Date;

  @Optional()
  public starIds?: string[];

  @Optional()
  public images?: string[];

  @Optional()
  public designator?: string;

  @Optional()
  public hot?: number;
}

export const UpdateAvPostDtoSchema =
  getSchema(UpdateAvPostDto).label("UpdateAvPostDto");
