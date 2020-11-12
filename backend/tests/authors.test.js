import ApolloClient, { gql } from 'apollo-boost';

export const client = new ApolloClient({
	uri: `http://localhost:${process.env['PORT']}/`,
	onError: () => { },
});

import 'cross-fetch/polyfill';

/* 
получаем список всех авторов и удаляем тех из них, кто является тестовым.
Тест не является обязательным, не может быть выполнен на бд продакшен, в ОЗУ выгружаются все авторы (если их много, то тест может упасть от нехватки памяти) и пр.
*/
beforeAll(async () => {
	function getGQLDeleteAuthorQuery(authorId) {
		return gql`
	mutation {
		deleteAuthor (authorId: "${authorId}")
	  }
	`
	}
	const gql_AllUsers = gql`
query {
	authors{
		authorId,
		name
	}
}
`
	const res = await client.query({
		query: gql_AllUsers
	})
	res.data.authors.forEach(async (author) => {
		if (author && author.authorId && (author.name || "").indexOf("@Test ") === 0)
			await client.mutate({
				mutation: getGQLDeleteAuthorQuery(author.authorId)
			})
	})
})

//придумаем имя автору. Внимание! нельзя осуществлять одновременное тестирование, подключаясь к одной базе, так как переменная authorName ниже может совпасть при одновременном проведении данного теста с нескольких инстансов (race condition)
const authorName = "@Test " + new Date().toISOString()
let authorId;

describe('Tests the createAuthor mutation', () => {
	//нельзя создать автора без имени
	it('should not create an author without a name', async () => {
		const createAuthor = gql`
            mutation {
              createAuthor(params: {}){
				authorId,
				name
              }
            }
            `;

		await expect(client.mutate({
			mutation: createAuthor
		})).rejects.toThrow();
	})

	//нельзя создать автора с длинным именем больше 255 символов
	it('should not create an author with a long name (more than 255 chars)', async () => {
		const createAuthor = gql`
            mutation {
              createAuthor(params: {name: "${authorName + "_".repeat(255)}"}){
				authorId,
				name
              }
            }
            `;

		await expect(client.mutate({
			mutation: createAuthor
		})).rejects.toThrow();
	})

	//создает автора
	it('should successfully create an author with valid params', async () => {
		const createAuthor = gql`
            mutation {
              createAuthor(params: {
                name: "${authorName}"
              }){
				authorId
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

	//второй раз автора с тем же именем создать нельзя
	it('should not create yet another author with the name identical to the name of an already existing author', async () => {
		const createAuthor = gql`
		mutation {
			createAuthor(params: {
			  name: "${authorName}"
			}){
			  authorId
			  name
			}
		  }
            `;
		await expect(client.mutate({
			mutation: createAuthor
		})).rejects.toThrow();
	});
});


describe('Tests the authors query', () => {
	//возвразает всех авторов (не для продакшен, опасно выгружать всю таблицу из бд)
	it('should return authors', async () => {
		const gql_AllUsers = gql`
query {
	authors{
		authorId,
		name
	}
}
`
		const res = await client.query({
			query: gql_AllUsers
		})

		await expect(res.data.authors.length).toBeGreaterThanOrEqual(1);
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
})