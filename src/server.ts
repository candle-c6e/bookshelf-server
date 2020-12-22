/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable import/first */
import * as dotenv from 'dotenv'
dotenv.config()

import "reflect-metadata";
import express, { Application, NextFunction, Request, Response } from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import connectDatabase from './database'
import { User } from './entities/user';
import { RequestCustom } from './types';
import { getManager } from 'typeorm';
import { BookMark } from './entities/bookmarks';

const app: Application = express()

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

async function main() {
  await connectDatabase()

  const entityManage = getManager()

  app.use((req: RequestCustom, _res: Response, next: NextFunction) => {
    let token = null
    const authorization = req.headers?.authorization ?? null

    if (authorization && authorization !== 'undefined') {
      token = authorization.split(" ")[1]
      token = jwt.verify(token, process.env.TOKEN_SECRET!)
    }
    req.token = token
    next()
  })

  app.get('/me', async (req: RequestCustom, res: Response) => {
    let token = req.token
    let user = null

    user = await User.findOne({ id: parseInt(token.id) }, { select: ["id", "name"] })

    return res.status(200).json({
      success: true,
      data: user
    })
  })

  app.get('/search', async (req: RequestCustom, res: Response) => {
    const { search } = req.query

    const books = await entityManage.query(`
      SELECT books.*, GROUP_CONCAT(authors.author) as authors, IF(book_mark.userId = 1, 1, 0) as isBookmark FROM (
        SELECT * FROM books WHERE title LIKE '%${search}%'
      ) books
      LEFT JOIN (
        SELECT * FROM authors
      ) authors ON authors.bookId = books.id
      LEFT JOIN (
        SELECT * FROM book_mark
      ) book_mark ON book_mark.booksId = books.id
      GROUP BY book_mark.id, books.id
      ORDER BY books.id
    `)

    if (!books.length) {
      return res.status(404).json({
        success: false,
        data: []
      })
    }

    return res.status(200).json({
      success: true,
      data: books
    })
  })

  app.get('/bookmark', async (req: RequestCustom, res: Response) => {
    const token = req.token

    const books = await entityManage.query(`
        select books.*, GROUP_CONCAT(authors.author) as authors from (
          select * from book_mark where userId = ${token.id}
        ) book_mark
        INNER JOIN (
          select * from books
        ) books ON books.id = book_mark.booksId
        INNER JOIN (
          select * from authors
        ) authors ON authors.bookId = books.id
        GROUP BY books.id
    `)

    if (!books.length) {
      return res.status(404).json({
        success: false,
        data: []
      })
    }

    return res.status(200).json({
      success: true,
      data: books
    })
  })

  app.get('/book/:id', async (req: RequestCustom, res: Response) => {
    const { id } = req.params

    const book = await entityManage.query(`
      SELECT books.*, GROUP_CONCAT(authors.author) as authors, IF(book_mark.userId = 1, 1, 0) as isBookmark FROM (
        SELECT * FROM books WHERE id = ${id}
      ) books
      LEFT JOIN (
        SELECT * FROM authors
      ) authors ON authors.bookId = books.id
      LEFT JOIN (
        SELECT * FROM book_mark
      ) book_mark ON book_mark.booksId = books.id
      GROUP BY book_mark.id
    `)

    if (!book) {
      return res.status(404).json({
        success: true,
        data: []
      })
    }

    return res.status(200).json({
      success: true,
      data: book[0]
    })
  })

  app.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body

    let user = await User.findOne({ username })

    if (!user) {
      return res.status(500).json({
        success: false,
        data: 'user is not exists.'
      })
    }

    const isMatched = await bcrypt.compare(password, user.password)

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        data: 'username or password is not matched.'
      })
    }

    const token = jwt.sign({ id: user?.id, name: user?.name }, process.env.TOKEN_SECRET!)

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name
        },
        token
      }
    })
  })

  app.post('/register', async (req: Request, res: Response) => {
    const { name, username, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    let user = await User.findOne({ username })

    if (user) {
      return res.status(500).json({
        success: false,
        data: 'user is already exists.'
      })
    }

    const newUser = await User.insert({
      name,
      username,
      password: hashedPassword
    })

    const userId = newUser.identifiers[0].id

    const selectUser = await User.findOne({ id: userId }, { select: ['id', 'name'] })

    const token = jwt.sign({ id: selectUser?.id, name: selectUser?.name }, process.env.TOKEN_SECRET!)

    return res.status(201).json({
      success: true,
      data: {
        user: selectUser,
        token
      }
    })
  })

  app.put('/bookmark', async (req: RequestCustom, res: Response) => {
    let token = req.token
    const { bookId } = req.body

    if (!token) {
      return res.status(500).json({
        success: false,
        data: "You are not authenticated."
      })
    }

    const resultBook = await entityManage.query(`
      SELECT * FROM book_mark WHERE booksId = ${bookId} AND userId = ${token.id}
    `)

    if (resultBook.length) {
      await entityManage.query(`
        DELETE FROM book_mark WHERE booksId = ${bookId} AND userId = ${token.id}
      `)
    } else {
      await BookMark.insert({ books: bookId, user: token.id })
    }

    return res.status(200).json({
      success: true,
      data: []
    })
  })

  app.listen(process.env.PORT || 4000, () => {
    console.log(`SERVER LISTEN ${process.env.PORT || 4000}`)
  })
}

main()