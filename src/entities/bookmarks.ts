import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Books } from "./books";
import { User } from "./user";

@Entity()
export class BookMark extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Books, books => books.bookmarks)
  books: number

  @ManyToOne(() => User, user => user.bookmarks)
  user: number
}