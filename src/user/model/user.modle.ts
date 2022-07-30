import { ID, ObjectType,Field } from "@nestjs/graphql";

@ObjectType()
export class UserModel{
  @Field(() => ID)
  public readonly id:String

  @Field()
  public readonly username:string

  @Field()
  public readonly password:string

  @Field()
  public readonly name:string

  @Field()
  public readonly authorization:string

  @Field()
  public readonly diskSize:number

  @Field()
  public readonly useSize:number
}