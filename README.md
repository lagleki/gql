*English specs currently absent but just browse through the code*

# Особенности

* создает авторов, книги (книга привязана к автору по полю authorId)
* возвращает список авторов, список книг, список книг с авторами
* Имя автора не может превышать 255 символов
* Имя автора уникально для базы данных (нельзя создать двух авторов с одним именем)
* Имя книги уникально для автора (нельзя создать для одного автора две книги с совпадающим именем книги)
* тестирование проводилось только на Ubuntu 18.04.4 LTS
* некоторые отсутствующие планируемые/необязательные фичи отмечены в коде пометкой `todo` 
* не для прода!
# Системные требования

* в ОС должен быть установлен Node.js>=12.0
* в ОС должна быть установлена MySQL/MariaDB или альтернативно Docker + Docker-Compose

# Установка

* Перейдите в папку репозитория (`cd gql`)
* если в системе не установлена MySQL/MariaDB, но установлен Docker, то установите MySQL через Docker:
	* откройте файл `mysql/docker-compose.yml`
	* отредактируйте его, поставив свободный порт, установив user и пароли к базе данных
	* запустите docker-контейнер:
    * для Ubuntu: `cd mysql ; docker-compose up -d ; cd ..` или `cd mysql ; sudo docker-compose up -d ; cd ..` в зависимости от типа установки Docker. Для остальных операционных систем выполните аналогичную команду
    * убедитесь, что MySQL работает (лог docker-контейнеров доступен через `sudo docker-compose logs -f -t` или `docker-compose logs -f -t`) и что MySQL доступен на выбранном порту (по умолчанию в `docker-compose.yml` это порт 3306; для Ubuntu список портов можно посмотреть по `netstat -tulpn`)
  * по умолчанию база данных будет хранить данные в папке `data`  
* Создайте файл `backend/.env`
* Скопируйте содержимое файла `backend/.env-sample` в `backend/.env`
* Отредактируйте содержимое файла `backend/.env`. Ниже краткое объясение значений параметров:
```
PORT=3000 // свободный в системе (на хосте localhost) порт, по которому будет доступно GraphQL API проекта
MYSQL_HOST=localhost // MYSQL_HOST из /mysql/docker-compose.yml или хост доступной в системе MySQL / MariaDB
MYSQL_PORT=3306 // остальные параметры MySQL
MYSQL_DBNAME=db
MYSQL_USER=user
MYSQL_PASSWORD=password // пароль пользователя MySQL/MariaDB (не root-пользователя)
GRAPHQL_PLAYGROUND=true // сделать ли доступной функцию Playground для Apollo GraphQL-сервера 
```
* Перейдите в папку репозитория (`gql`), если Вы не в ней
* установите зависимости:
	* `cd backend ; npm i`
* запустите GraphQL API:
	* `npm start`
* появится сообщение типа `GraphQL endpoint up'n'running at http://localhost:3000/`
* откройте этот адрес в браузере, получив доступ к GraphQL Playground
* в отдельном терминале перейдите в папку репозитория (`gql`) и запустите тесты:
	* `cd backend ; npm test`

# Примеры GraphQL-запросов

Создание автора:
```
mutation {
	createAuthor(params: {
		name: "John Smith"
	}){
	authorId
	name
	}
}
```

Создание книги:
```
mutation {
        createBook(
          params: {
            name: "ama bebe-1", 
            pageCount: 10, 
            authorId: "AUTHOR_ID"
          }
        ) {
         bookId
    name
        }
      }
```
где вместо AUTHOR_ID необходимо вписать authorId из результата предыдущего запроса.

Повторное выполнение такого же запроса по созданию автора/книги приведет к ошибке (имя автора должно быть уникально, имя книги для автора должно быть уникально).

Получение списка авторов:

```
query {
        authors{
          authorId,
          name
        }
      }
```

Получение списка книг без авторов:
```
{
  books() {
    name
  }
}

```
Получение списка книг с авторами:
```
{
  books() {
    name
    author {
      name
    }
  }
}
```
