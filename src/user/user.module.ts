import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserResovler } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports:[TypeOrmModule.forFeature([UserEntity]),],
  providers: [UserService, UserResovler],
  exports: [UserService]
})
export class UserModule {}
 