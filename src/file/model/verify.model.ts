import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class VerifyModel{

  constructor(shouldUpload:boolean,fileList:string[]){
    this.shouldUpload = shouldUpload
    this.fileList = fileList
  }

  @Field()
  shouldUpload:boolean
 
  @Field(() => [String])
  fileList:string[]
} 