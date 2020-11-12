import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from "typeorm"
import { ObjectType, Field, ID, Int } from "type-graphql"
import { Author } from "./Author"

@Entity()
@ObjectType()
class Book extends BaseEntity {
  @Field(() => ID) // type-graphql to typeorm mapping
  @PrimaryGeneratedColumn("uuid")
  bookId: string

  @Field(() => String) // type-graphql to typeorm mapping
  @Column({ unique: true, nullable: false, type: "varchar", length: 255 })
  name: string

  @Field(() => Int) // type-graphql to typeorm mapping
  @Column()
  pageCount: number

  @Field(() => String) // type-graphql to typeorm mapping
  @Column()
  authorId: string

  @Field(() => Author) // type-graphql to typeorm mapping
  @ManyToOne((_) => Author, (_) => _.books)
  author: Author
}

export { Book }
