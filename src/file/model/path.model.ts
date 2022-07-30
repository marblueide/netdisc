import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PathModel{

  @Field()
  name:String

  @Field()
  update:String

  @Field()
  size:number

  @Field()
  directory:Boolean

  @Field()
  type:string

  @Field()
  imgSrc:string
} 