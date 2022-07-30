import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { LoginInput } from './dtos/login.input';
import { RegisterInput } from './dtos/register.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginInput: LoginInput) {
    const {username,password} = loginInput
    const res = await this.validateUser(username,password);
    return this.generteJWT(res)
  }

  async register(registerInput:RegisterInput){
    const {username} = registerInput;
    const curUserByUserName = await this.userService.findOneByUsername(username)

    if(curUserByUserName){
      throw new ForbiddenError('UserName has already been used, Please enter another one.')
    }else{
      const user = await this.userService.create(registerInput)
      return this.generteJWT(user)
    }
  }




  public async validateUser(username:string,password:string):Promise<UserEntity>{
    const user = await this.userService.findOneByUsername(username)
    if(user && user.password == password){
      const {password,...res} = user
      return res;
    }
    throw new AuthenticationError('Your username and password do not match. Please try again!')
  } 

  public generteJWT(user:UserEntity){
    const payload = { username: user.username, sub: user.id };
    const {password,...rest} = user
    return {
      authorization: this.jwtService.sign(payload), 
      ...rest
    }
  }
}
