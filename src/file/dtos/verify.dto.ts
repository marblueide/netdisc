import { IsBoolean, IsString } from "class-validator";

export class VerifyDto{
  @IsString()
  filename:string

  @IsString()
  hash:string

  @IsBoolean()
  isBigFile:boolean

  @IsString()
  path:string
}