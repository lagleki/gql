import dotenv = require("dotenv")
dotenv.config()
import "reflect-metadata"
import { ApolloServer } from "apollo-server"
import { Container } from "typedi"
import * as TypeORM from "typeorm"
import { buildSchema } from "type-graphql"
//todo: использовать вместо относительных путей module aliases:
import { AuthorResolver } from "./resolvers/author-resolver"
import { BookResolver } from "./resolvers/book-resolver"
import dbconfig from "./service/custom-config"

TypeORM.useContainer(Container)

;(async () => {
  await TypeORM.createConnection(dbconfig.config(process.env))

  const schema = await buildSchema({
    resolvers: [AuthorResolver, BookResolver],
  })

  const server = new ApolloServer({
    schema,
    playground: process.env.GRAPHQL_PLAYGROUND == "true",
  })

  const { url } = await server.listen(process.env.PORT || 3000)
  console.log(`GraphQL endpoint up'n'running at ${url}`)
})()
