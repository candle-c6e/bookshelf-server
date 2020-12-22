import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Authors } from "./authors";
import { BookMark } from "./bookmarks";

@Entity()
export class Books extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  bookId: string;

  @Column()
  title: string;

  @Column({
    default: null,
    nullable: true
  })
  publishedDate: string;

  @Column({
    default: null,
    nullable: true
  })
  thumbnail: string;

  @Column({
    default: null,
    nullable: true
  })
  infoLink: string

  @Column({
    default: null,
    nullable: true,
    type: 'text'
  })
  description: string

  @OneToMany(() => Authors, authors => authors.book)
  authors: Authors[]

  @OneToMany(() => BookMark, bookmark => bookmark.books)
  bookmarks: BookMark[]
}