import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UploadModel{

  @Field()
  public readonly file:File
}