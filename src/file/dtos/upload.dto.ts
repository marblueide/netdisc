import { IsString } from 'class-validator';

export class UploadDto {
  @IsString()
  path: string;

  @IsString()
  filename:string
}


export class UploadBigFileDto {
  @IsString()
  hash:string

  @IsString()
  filename:string

  @IsString()
  path:string
}