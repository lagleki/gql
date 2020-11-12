import { InputType, Field } from "type-graphql"
import { MaxLength } from "class-validator"

@InputType()
export class AuthorInput {
  @Field(() => String, { nullable: false })
  @MaxLength(255)
  name: string
}
