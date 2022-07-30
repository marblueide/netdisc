import { IsNotEmpty, IsString } from "class-validator";


export class DownloadDto{
  @IsString()
  @IsNotEmpty()
  public readonly path:string

  @IsString()
  @IsNotEmpty()
  public readonly fileName:string
}