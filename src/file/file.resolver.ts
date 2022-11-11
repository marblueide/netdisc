import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FileService } from './file.service';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { PathModel } from './model/path.model';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { GraphQLAuthGuard } from 'src/common/guard/graphql.auth.guard';
import { GenerMessageModel } from 'src/common/model/generMessage.model';
import { reNameInput } from './dtos/reName.input';
import { GraphQLUpload } from 'graphql-upload';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import { VerifyModel } from './model/verify.model';

@Resolver()
export class FileResolver {
  private baseSrc = resolve('static/user');
  private filenameMapDir = new Map<string, string>();
  private BIGPIPESIZE = 10 * 1024 * 1024;
  constructor(private readonly fileService: FileService) {}

  @Query(() => [PathModel])
  @UseGuards(GraphQLAuthGuard)
  async getPath(@Args('path') path: string, @CurrentUser() user: any) {
    return await this.fileService.getPath(path, user.userId);
  }

  @UseGuards(GraphQLAuthGuard)
  @Mutation(() => GenerMessageModel)
  async mkdir(@Args('path') path: string, @CurrentUser() user: any) {
    try {
      await this.fileService.mkdir(path, user.userId);
      return new GenerMessageModel(200, '创建成功');
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }

  @Mutation(() => GenerMessageModel)
  @UseGuards(GraphQLAuthGuard)
  async deleteDir(
    @Args({
      name: 'paths',
      type: () => [String],
    })
    paths: string[],
    @CurrentUser() user: any,
  ) {
    try {
      for await (const path of paths) {
        await this.fileService.deleteDir(path, user.userId);
      }
      return new GenerMessageModel(200, '删除成功');
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  @Mutation(() => GenerMessageModel)
  @UseGuards(GraphQLAuthGuard)
  async reName(@Args('input') input: reNameInput, @CurrentUser() user: any) {
    try {
      await this.fileService.reName(
        user.userId,
        input.path,
        input.lastName,
        input.nextName,
      );
      return new GenerMessageModel(200, '重命名成功');
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  @Mutation(() => GenerMessageModel)
  @UseGuards(GraphQLAuthGuard)
  async uploadFile(
    @Args({ name: 'file', type: () => [GraphQLUpload] }) files,
    @Args({ name: 'path', type: () => String }) path: string,
    @CurrentUser() user: any,
  ) {
    try {
      const promiseArr = [];

      for await (const file of files) {
        promiseArr.push(
          this.fileService.upload(
            this.fileService.unionPath(this.baseSrc, user.userId, path),
            file,
          ),
        );
      }

      await Promise.all(promiseArr);

      return new GenerMessageModel(200, '上传成功');
    } catch (error) {
      throw new HttpException(error, HttpStatus.FORBIDDEN);
    }
  }

  @Mutation(() => GenerMessageModel)
  @UseGuards(GraphQLAuthGuard)
  async uploadBigFile(
    @Args({
      name: 'chunk',
      type: () => GraphQLUpload,
    })
    chunk,
    @Args({
      name: 'hash',
      type: () => String,
    })
    hash,
    @Args({ name: 'path', type: () => String }) path,
    @Args({
      name: 'filename',
      type: () => String,
    })
    filename,
    @CurrentUser() user: any,
  ) {
    try {
      let dir = this.getHashDir({
        filename,
        user,
        hash,
        path,
      });
      await this.fileService.upload(dir, chunk, hash);
      return new GenerMessageModel(200, `上传成功，${hash}`);
    } catch (error) {
      throw new HttpException(error, HttpStatus.FORBIDDEN);
    }
  }

  @Mutation(() => GenerMessageModel)
  @UseGuards(GraphQLAuthGuard)
  async mergerFile(
    @Args({
      name: 'filename',
      type: () => String,
    })
    filename,
  ) {
    const dir = this.filenameMapDir.get(filename);
    await this.fileService.mergeFile(filename, dir, this.BIGPIPESIZE);
    return new GenerMessageModel(200, `上传成功-${filename}`);
  }

  @Query(() => VerifyModel)
  @UseGuards(GraphQLAuthGuard)
  async verify(
    @Args({
      name: 'hash',
      type: () => String,
    })
    hash,
    @Args({ name: 'path', type: () => String }) path,
    @Args({
      name: 'filename',
      type: () => String,
    })
    filename,
    @CurrentUser() user: any,
  ) {
    let dir;
    if (hash) {
      dir = this.getHashDir({
        hash,
        filename,
        user,
        path,
      });
      const chunkList = await readdir(dir);
      return new VerifyModel(true, chunkList);
    } else {
      dir = this.fileService.unionPath(
        this.baseSrc,
        user.userId,
        path,
        filename,
      );
      return new VerifyModel(!existsSync(dir), []);
    }
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
    this.filenameMapDir.set(filename, dir);
    return dir;
  }
}
