import { Injectable, StreamableFile } from '@nestjs/common';
import {
  mkdir,
  readdir,
  rename,
  stat,
  rm,
  unlink,
  writeFile,
} from 'fs/promises';
import { resolve, parse, join } from 'path';
import { UserService } from 'src/user/user.service';
import * as mime from 'mime';
import { prefix } from '../common/utils/index';
import {
  createReadStream,
  createWriteStream,
  rmdirSync,
  unlinkSync,
  WriteStream,
} from 'fs';
import { PathModel } from './model/path.model';

@Injectable()
export class FileService {
  private baseSrc = resolve('static/user');
  private expDir = ['_'];
  constructor(private readonly userService: UserService) {}

  public async upload(src: string, file: Express.Multer.File, filename?: string) {
    const path = resolve(src, filename || file.filename);
    await this.dirExists(src);
    return await writeFile(path,file.buffer);
  }

  public async download(src: string, fileName: string) {
    const file = createReadStream(join(src, fileName));
    return new StreamableFile(file);
  }

  public async mergeFile(filename: string, dir: string,size:number) {
    const chunkList = await readdir(dir);
    chunkList.sort((a, b) => {
      //@ts-ignore
      return a.split('-')[1] - b.split('-')[1];
    });
    const promiseList = chunkList.map((chunk,index) => {
      return this.pipeStream(
        resolve(dir, chunk),
        createWriteStream(join(dir, '../', filename), {
          start:index * size
        }),
      );
    });
    await Promise.all(promiseList);
    rmdirSync(dir)
  }

  public async pipeStream(
    path: string,
    writeStream: WriteStream,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const readStream = createReadStream(path);
      readStream.on('end', async () => {
        unlinkSync(path);
        resolve();
      });
      readStream.pipe(writeStream);
    });
  }

  public async getPath(dir: string, id: string) {
    const path = this.unionPath(this.baseSrc, id, dir);
    await this.dirExists(path);
    const fileLists = await readdir(path);
    const res = [];
    for await (let file of fileLists) {
      const curStat = await stat(resolve(path, file));
      if (
        curStat.isDirectory() &&
        this.expDir.some((dir) => file.includes(dir))
      ) {
        continue;
      }
      const obj = {};
      obj['name'] = file;
      //@ts-ignore
      obj['type'] = mime.getType(file) || 'directory';
      obj['directory'] = curStat.isDirectory();
      obj['update'] = curStat.mtime;
      obj['size'] = curStat.size;
      obj['imgSrc'] = obj['type'].includes('image')
        ? join('/user', id, dir, file).replace(/\/{2,4}/g, '/')
        : '';
      res.push(obj);
    }
    return res;
  }

  async mkdir(dir: string, id: string) {
    const path = this.unionPath(this.baseSrc, id, dir);
    await this.dirExists(path);
  }

  async deleteDir(dir: string, id: string) {
    const path = this.unionPath(this.baseSrc, id, dir);
    const st = await stat(path);
    if (st.isDirectory()) {
      await rm(path, {
        recursive: true,
      });
    } else {
      await unlink(path);
    }
  }

  async reName(id: string, dir: string, lastName: string, newName: string) {
    const lastPath = this.unionPath(this.baseSrc, id, dir, lastName);
    const newPath = this.unionPath(this.baseSrc, id, dir, newName);
    await rename(lastPath, newPath);
  }

  unionPath(baseSrc: string, ...args: string[]) {
    const path = args
      .reduce((pre, cur) => {
        return pre + '/' + cur;
      }, '/')
      .replace(/\/{2,4}/g, '/');

    return resolve(baseSrc + path);
  }

  async dirExists(dir: string) {
    try {
      await stat(dir);
    } catch (error) {
      await mkdir(dir, { recursive: true });
    }
  }
}
