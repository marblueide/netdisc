import { InputType, Field } from '@nestjs/graphql'
import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator'

@InputType()
export class LoginInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  public readonly username: string

  @Field()
  @IsString()
  @MaxLength(20)
  @MinLength(6)
  @IsNotEmpty()
  public readonly password: string
}
