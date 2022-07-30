import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity{
  @PrimaryGeneratedColumn("uuid")
  id:string

  @Column()
  username:string

  @Column()
  password?:string

  @Column()
  name:string

  @Column({
    default: 1 * 1024 * 1024
  })
  diskSize:number

  @Column({
    default:0
  })
  useSize:number
}