/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  FileInterceptor,
  FilesInterceptor,
  AnyFilesInterceptor,
} from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import { join, resolve } from 'path';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { GraphQLAuthGuard } from 'src/common/guard/graphql.auth.guard';
import { GenerMessageModel } from 'src/common/model/generMessage.model';
import { DownloadDto } from './dtos/download.dto';
import { MergeDto } from './dtos/merge.dto';
import { UploadBigFileDto, UploadDto } from './dtos/upload.dto';
import { VerifyDto } from './dtos/verify.dto';
import { FileService } from './file.service';
import { VerifyModel } from './model/verify.model';

@Controller('file')
export class FileController {
  private baseSrc = resolve('static/user');
  private filenameMapDir = new Map<string, string>();
  private BIGPIPESIZE = 10 * 1024 * 1024;
  constructor(private readonly fileService: FileService) {}

  @Post('download')
  @UseGuards(AuthGuard('jwt'))
  async download(@Body() data: DownloadDto, @CurrentUser() user: any) {
    const path = join(this.baseSrc, user.userId, data.path);
    return this.fileService.download(path, data.fileName);
  }

  @Post('verify')
  @UseGuards(AuthGuard('jwt'))
  async verify(@Body() input: VerifyDto, @CurrentUser() user: any) {
    const { hash, filename, path, isBigFile } = input;
    let dir = this.fileService.unionPath(
      this.baseSrc,
      user.userId,
      path,
      filename,
    );
    let isExsit = existsSync(dir);
    console.log(dir,isExsit)
    if (isBigFile && !isExsit) {
      dir = this.getHashDir({
        hash,
        filename,
        user,
        path,
      });
      let chunkList = [];
      if (existsSync(dir)) {
        chunkList = await readdir(dir);
      }
      return new VerifyModel(true, chunkList);
    }
    return new VerifyModel(!isExsit, []);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard('jwt'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadDto,
    @CurrentUser() user: any,
  ) {
    try {
      await this.fileService.upload(
        this.fileService.unionPath(this.baseSrc, user.userId, body.path),
        file,
        body.filename,
      );
      return new GenerMessageModel(200, '上传成功');
    } catch (error) {
      throw new HttpException(error, HttpStatus.FORBIDDEN);
    }
  }

  @Post('uploadBig')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard('jwt'))
  async uploadBigFile(
    @UploadedFile() file,
    @Body() { filename, hash, path }:UploadBigFileDto,
    @CurrentUser() user: any,
  ) {
    try {
      let dir = this.getHashDir({
        filename,
        user,
        hash,
        path,
      });
      await this.fileService.upload(dir, file, hash);
      return new HttpException('上传成功', HttpStatus.ACCEPTED);
    } catch (error) {
      throw new HttpException(error, HttpStatus.FORBIDDEN);
    }
  }

  @Post('mergerFile')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(AnyFilesInterceptor())
  async mergerFile(
    @Body() {filename,path}:MergeDto
  ) {
    const dir = this.filenameMapDir.get(`${filename}-${path}`);
    await this.fileService.mergeFile(filename, dir, this.BIGPIPESIZE);
    return new HttpException('上传成功', HttpStatus.ACCEPTED);
  }

  getHashDir(data: {
    filename: string;
    hash: string;
    user: any;
    path: string;
  }) {
    const { filename, hash, user, path } = data;
    let dir = this.filenameMapDir.get(filename);
    if (dir) return dir;
    let hash_pre = hash.split('-')[0];
    dir = this.fileService.unionPath(
      this.baseSrc,
      user.userId,
      path,
      '_' + hash_pre,
    );
    this.filenameMapDir.set(`${filename}-${path}`, dir);
    return dir;
  }
}
