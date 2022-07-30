import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GenerMessageModel {
  @Field()
  code:number
  
  @Field()
  message:string

  constructor(code:number = 200,message:string = "ok"){
    this.code = code
    this.message = message
  }
}