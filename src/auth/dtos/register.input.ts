import { Field, InputType } from "@nestjs/graphql"
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

@InputType()
export class RegisterInput {

  @Field()
  @IsString()
  @IsNotEmpty()
  public readonly username:string

  @Field()
  @IsString()
  @MaxLength(20)
  @MinLength(6)
  @IsNotEmpty()
  public readonly password:string

  @Field()
  @IsString()
  @IsNotEmpty()
  public readonly name:string
}