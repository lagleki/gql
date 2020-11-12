import { InputType, Field, Int } from "type-graphql"
import { MaxLength } from "class-validator"

@InputType()
export class BookInput {
  @Field(() => String, { nullable: false })
  @MaxLength(255)
  name: string

  //todo: разрешить только натуральные числа, ввод отрицательного числа как pageCount пока не приводит к ошибке:
  @Field(() => Int)
  pageCount: number

  @Field(() => String)
  authorId: string
}
