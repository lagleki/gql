import { getRepository } from "typeorm"
import {
  Resolver,
  Query,
  Arg,
  FieldResolver,
  Root,
  Mutation,
} from "type-graphql"
import to from "await-to-js"
import { Book } from "../entities/Book"
import { BookInput } from "./types/book-input"
import { Author } from "../entities/Author"

@Resolver((of) => Book)
class BookResolver {
  @Query((returns) => [Book])
  //получаем все книги из бд:
  async books(@Root() books: Book[]): Promise<Book[]> {
    return getRepository(Book).find()
  }

  //получаем объект "автор книги":
  @FieldResolver()
  async author(@Root() book: Book): Promise<Author | undefined> {
    return getRepository(Author).findOne(book.authorId)
  }

  //создаем книгу:
  @Mutation(() => Book)
  async createBook(@Arg("params") params: BookInput): Promise<Book> {
    params.name = params.name.trim()
    const book = getRepository(Book).create(params)
    const [err] = await to(book.save()) // оборачиваем фнукцию сохранения в "to", чтобы была возможность кастомной ошибки
    if (err)
      throw new Error(
        `Failed to create the book. params of the book requested: ${JSON.stringify(
          params
        )}`
      )

    return book
  }

  //удаляем книгу:
  @Mutation(() => Boolean)
  async deleteBook(@Arg("bookId") bookId: string): Promise<Boolean> {
    let [err, book] = await to(
      getRepository(Book).findOne({ where: { bookId } })
    )

    // ошибка получения книги (либо проблема с бд, либо книга не найдена):
    if (err || !book)
      throw new Error(`Book doesn't exist. bookId requested: ${bookId}`)
    ;[err] = await to(book.remove())
    //ошибка бд при удалении книги:
    if (err)
      throw new Error(
        `Failed to delete the book. Likely explanations of the error: database connection / deleted by someone else. bookId requested: ${bookId}`
      )

    return true
  }
}

export { BookResolver }
