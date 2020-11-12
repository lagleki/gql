import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from "typeorm"
import { Field, ID, ObjectType } from "type-graphql"
import { Book } from "./Book"

@Entity()
@ObjectType()
class Author extends BaseEntity {
  @Field(() => ID) // type-graphql to typeorm mapping
  @PrimaryGeneratedColumn("uuid")
  authorId: string

  @Field(() => String) // type-graphql to typeorm mapping
  @Column({ unique: true, nullable: true, type: "varchar", length: 255 })
  name: string

  @Field(() => [Book]) // type-graphql to typeorm mapping
  @OneToMany((_) => Book, (_) => _.author)
  books: Book[]
}

export { Author }
