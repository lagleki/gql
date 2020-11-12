import { ConnectionOptions } from "typeorm"
import { Author } from "../entities/Author"
import { Book } from "../entities/Book"

export default {
  config: function (dbParams: any): ConnectionOptions {
    const dbParamsProcessed = {
      host: dbParams.MYSQL_HOST || "localhost",
      port: dbParams.MYSQL_PORT || 3306,
      username: dbParams.MYSQL_USER || "user",
      password: dbParams.MYSQL_PASSWORD || "",
      database: dbParams.MYSQL_DBNAME || "db",
    }

    const dbconfig: ConnectionOptions = {
      ...dbParamsProcessed,
      //todo: обеспечить работу с произвольной базой данных, поддерживаемой typeorm:
      type: "mysql",
      synchronize: true,
      logging: false,
      entities: [Author, Book],
      dropSchema: false,
    }
    return dbconfig
  },
}
