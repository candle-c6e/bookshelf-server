import { createConnection } from 'typeorm'
import { User } from '../entities/user'
import { BookMark } from '../entities/bookmarks'
import { Authors } from '../entities/authors'
import { Books } from '../entities/books'

async function connect() {
  const connection = await createConnection({
    type: "mysql",
    host: process.env.DB_HOST,
    port: 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'bookshelf',
    entities: [
      User,
      BookMark,
      Books,
      Authors
    ],
    synchronize: true,
    logging: false,
  })

  return connection
}

export default connect