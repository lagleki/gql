import ApolloClient, { gql } from 'apollo-boost';

export const client = new ApolloClient({
	uri: `http://localhost:${process.env['PORT']}/`,
	onError: () => { },
});

import 'cross-fetch/polyfill';

/* 
получаем список всех книг и удаляем тех из них, которые являются тестовыми.
Тест не является обязательным, не может быть выполнен на бд продакшен, в ОЗУ выгружаются все книги (если их много, то тест может упасть от нехватки памяти) и пр.
*/
beforeAll(async () => {
	function getGQLDeleteBookQuery(bookId) {
		return gql`
	mutation {
		deleteBook (bookId: "${bookId}")
	  }
	`
	}
	const gql_AllBooks = gql`
query {
	books{
		bookId,
		name
	}
}
`
	const res = await client.query({
		query: gql_AllBooks
	})
	res.data.books.forEach(async (book) => {
		if (book && book.bookId && (book.name || "").indexOf("@Test ") === 0)
			await client.mutate({
				mutation: getGQLDeleteBookQuery(book.bookId)
			})
	})
})

//придумаем имя автору книги. Внимание! нельзя осуществлять одновременное тестирование, подключаясь к одной базе, так как переменная authorName ниже может совпасть при одновременном проведении данного теста с нескольких инстансов (race condition)
const authorName = "@Test " + new Date().toISOString()
let authorId;

//придумаем имя книге. Внимание! нельзя осуществлять одновременное тестирование, подключаясь к одной базе, так как переменная bookName ниже может совпасть при одновременном проведении данного теста с нескольких инстансов (race condition)
const bookName = "@Test " + new Date().toISOString()
let bookId;

//сообщения только по английски, так как не все терминалы поддерживают не-ASCII символы 
describe('Tests the createBook mutation', () => {
	//нельзя создать книгу без authorId
	it('should not create a book without an authorId', async () => {
		const createBook = gql`
            mutation {
              createBook(params: {
				  pageCount: 100
				  name: "${bookName}"
				}){
				bookId,
				authorId,
				name,
				pageCount
              }
            }
            `;

		await expect(client.mutate({
			mutation: createBook
		})).rejects.toThrow();
	})
	//успешно создает автора:
	it('should successfully create an author with valid params', async () => {
		const createAuthor = gql`
            mutation {
              createAuthor(params: {
                name: "${authorName}"
              }){
				authorId,
				name
              }
            }
            `;

		const res = await client.mutate({
			mutation: createAuthor
		})
		authorId = res.data.createAuthor.authorId
		expect(res.data.createAuthor.name).toBe(authorName);
	});

	//нельзя создать книгу с длинным (более 255 символов) именем
	it('should not create a book with a long name (more than 255 chars)', async () => {
		const createBook = gql`
            mutation {
              createBook(params: {
				  authorId: "${authorId}"
				  pageCount: 100
				  name: "${bookName + "_".repeat(255)}"
				}){
				authorId,
				name,
				pageCount
              }
            }
            `;

		await expect(client.mutate({
			mutation: createBook
		})).rejects.toThrow();
	})

	//нельзя создать книгу, если тип поля указан  неверно, например, pageCount не число
	it('should not create a book with pageCount not being a number', async () => {
		const createBook = gql`
            mutation {
              createBook(params: {
				  pageCount: "100"
				  authorId: "${authorId}"
				  name: "${bookName}"
				}){
				authorId,
				name
              }
            }
            `;

		await expect(client.mutate({
			mutation: createBook
		})).rejects.toThrow();
	})

	// создает книгу
	it('should successfully create a book with valid params', async () => {
		const createBook = gql`
			mutation {
				createBook(params: {
					pageCount: 100
					authorId: "${authorId}"
					name: "${bookName}"
					}){
					bookId,
					name
				}
			}
            `;

		const res = await client.mutate({
			mutation: createBook
		})
		bookId = res.data.createBook.bookId
		expect(res.data.createBook.name).toBe(bookName);
	});

	//второй раз книгу с тем же автором и именем книги создать не получится
	it('should not create yet another book with the name identical to the name of an already existing bok of the same author', async () => {
		const createBook = gql`
		mutation {
			createBook(params: {
				pageCount: 100
				authorId: "${authorId}"
				name: "${bookName}"
				}){
				bookId,
				name
			}
		}
            `;
		await expect(client.mutate({
			mutation: createBook
		})).rejects.toThrow();
	});
});


describe('Tests the book query', () => {
	//возвращает все книги (для продакшен опасно возвращать всю таблицу из бд)
	it('should return all the books', async () => {
		const gql_AllBooks = gql`
query {
	books{
		bookId,
		pageCount,
		name
	}
}
`
		const res = await client.query({
			query: gql_AllBooks
		})

		await expect(res.data.books.length).toBeGreaterThanOrEqual(1);
	});
	//возвращает все книги с авторами:
	it('should return all the books with authors', async () => {
		const gql_AllBooks = gql`
query {
	books{
		bookId,
		authorId,
		pageCount,
		name
	}
}
`
		const res = await client.query({
			query: gql_AllBooks
		})

		await expect(res.data.books.length).toBeGreaterThanOrEqual(1);
	});
});

//чистим за собой:
afterAll(async () => {
	const deleteAuthor = gql`
		mutation {
			deleteAuthor (authorId: "${authorId}")
		  }
		`
	await client.mutate({
		mutation: deleteAuthor
	})
	const deleteBook = gql`
		mutation {
			deleteBook (bookId: "${bookId}")
		  }
		`
	await client.mutate({
		mutation: deleteBook
	})
})