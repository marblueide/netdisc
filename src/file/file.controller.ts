/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { join, resolve } from 'path';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { GraphQLAuthGuard } from 'src/common/guard/graphql.auth.guard';
import { DownloadDto } from './dtos/download.dto';
import { FileService } from './file.service';

@Controller("file")
export class FileController {
  private baseSrc = resolve('static/user');

  constructor(
    private readonly fileService:FileService
  ){}

  @Post("download")
  @UseGuards(AuthGuard('jwt'))
  async download(@Body() data:DownloadDto,@CurrentUser() user: any){
    const path = join(this.baseSrc,user.userId,data.path)
    return this.fileService.download(path,data.fileName)
  }
}
