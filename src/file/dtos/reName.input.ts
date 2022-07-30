import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator"

@InputType()
export class reNameInput{
  @Field()
  @IsNotEmpty()
  @IsString()
  public readonly path:string

  @Field()
  @IsNotEmpty()
  @IsString()
  public readonly lastName:string

  @Field()
  @IsNotEmpty()
  @IsString()
  public readonly nextName:string
}