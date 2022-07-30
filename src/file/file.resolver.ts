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

@Resolver()
export class FileResolver {
  private baseSrc = resolve('static/user');
  constructor(private readonly fileService: FileService) {}

  @Query(() => [PathModel])
  @UseGuards(GraphQLAuthGuard)
  async getPath(@Args('path') path: string, @CurrentUser() user: any) {
    return await this.fileService.getPath(path, user.userId);
  }

  @Mutation(() => GenerMessageModel)
  @UseGuards(GraphQLAuthGuard)
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

      for await (const file of files){
        promiseArr.push(this.fileService.upload(
          this.fileService.unionPath(this.baseSrc,user.userId, path),
          file,
        ))
      }

      await Promise.all(promiseArr);
      
      return new GenerMessageModel(200, '上传成功');
    } catch (error) {
      throw new HttpException(error,HttpStatus.FORBIDDEN)
    }
  }

}
