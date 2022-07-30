import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterInput } from 'src/auth/dtos/register.input';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import {v4 as uuid} from "uuid"

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async findOneById(id: string) {
    return this.userRepository.findOneBy({
      id,
    });
  }

  public async findOneByUsername(username: string) {
    return this.userRepository.findOneBy({
      username,
    });
  }

  public async create(input:RegisterInput){
    return this.userRepository.save(input)
  }
}
