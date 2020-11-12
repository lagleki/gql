import { getRepository } from "typeorm"
import { Resolver, Query, Arg, Mutation } from "type-graphql"
import to from "await-to-js" // оборачивает промисы по типу языка Go, предотвращая возможность throw ошибок
import { Author } from "../entities/Author" // описание сущности (аналог таблиц в MySQL/PostgreSQL)
import { AuthorInput } from "./types/author-input" // валидация инпута

@Resolver((of) => Author)
class AuthorResolver {
  //извлекаем всех авторов из бд:
  // fetch all authors from the database
  @Query(() => [Author])
  authors(): Promise<Author[]> {
    return getRepository(Author).find()
  }

  // создаем нового автора и сохраняем его в бд:
  // create a new author and persist it in the database
  @Mutation(() => Author)
  async createAuthor(@Arg("params") params: AuthorInput): Promise<Author> {
    params.name = params.name.trim() // удаляет пробелы до и после имени
    const author = getRepository(Author).create(params)
    const [err] = await to(author.save()) // в случае если обертка to указывает на ошибку, возвращаем кастомный текст ошибки
    if (err)
      throw new Error(
        `Failed to create the author. params of the author requested: ${JSON.stringify(
          params
        )}`
      )

    return author
  }

  // удаляем автора
  // todo: опционально реализовать cascade удаления всех книг при удалении их автора. контраргумент: потеря контроля над операциями в бд, лучше реализовать логику самим

  @Mutation(() => Boolean)
  async deleteAuthor(@Arg("authorId") authorId: string): Promise<Boolean> {
    let [err, author] = await to(
      getRepository(Author).findOne({ where: { authorId } })
    )

    // разрешено удалять только авторов, чьё name начинается с "@Test "
    if ((author?.name || "").indexOf("@Test ") !== 0)
      throw new Error(
        `No permissions to delete the author. You are  only allowed to deleted test records. authorId requested: ${authorId}`
      )

    // ошибка бд при поиске автора
    if (err)
      throw new Error(
        `Failed to fetch the author. Could be a database architecture/connection error. authorId requested: ${authorId}`
      )

    // автор уже был удалён или просто не существует
    if (!author)
      throw new Error(`Author doesn't exist. authorId requested: ${authorId}`)
    ;[err] = await to(author.remove())

    // ошибка бд при удалении
    if (err)
      throw new Error(
        `Failed to deleted the author. Likely explanations of the error: database connection / deleted by someone else. authorId requested: ${authorId}`
      )

    return true
  }
}

export { AuthorResolver }
