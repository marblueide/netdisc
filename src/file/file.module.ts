import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileResolver } from './file.resolver';
import { UserModule } from 'src/user/user.module';
import { FileController } from './file.controller';

@Module({
  imports:[UserModule],
  providers: [FileService, FileResolver],
  controllers:[FileController]
})
export class FileModule {}
