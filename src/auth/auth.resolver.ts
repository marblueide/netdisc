import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserModel } from 'src/user/model/user.modle';
import { AuthService } from './auth.service';
import { LoginInput } from './dtos/login.input';
import { RegisterInput } from './dtos/register.input';
import { Token } from './model/token';

@Resolver(() => Token)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserModel)
  public async register(@Args("input") input:RegisterInput){
    return this.authService.register(input)
  }

  @Query(() => UserModel)
  public async login(@Args('input') input: LoginInput) {
    return this.authService.login(input)
  }
}
