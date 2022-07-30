import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { GraphQLAuthGuard } from 'src/common/guard/graphql.auth.guard';
import { UserModel } from './model/user.modle';
import { UserService } from './user.service';

@Resolver()
export class UserResovler {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserModel)
  @UseGuards(GraphQLAuthGuard)
  async getUserById(
    @Args({ name: 'id', type: () => String }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.userService.findOneById(id)
  }
}
