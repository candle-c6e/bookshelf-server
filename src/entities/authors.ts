import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Books } from './books';

@Entity()
export class Authors extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  author: string;

  @ManyToOne(() => Books, books => books.authors)
  book: Books
}