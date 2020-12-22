import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { BookMark } from './bookmarks';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true
  })
  name: string;

  @Column({
    unique: true
  })
  username: string;

  @Column()
  password: string

  @OneToMany(() => BookMark, bookmark => bookmark.user)
  bookmarks: BookMark[]
}