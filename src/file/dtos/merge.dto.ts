import { IsString } from "class-validator";

export class MergeDto{
  @IsString()
  public filename:string

  @IsString()
  public path:string
}