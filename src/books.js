
import dayjs from "dayjs"
import db from "./db.js"
import express from "express"
import Joi from "joi"
import { nanoid } from "nanoid"

const books = express()

const GetBook = Joi.object({
  id: Joi.string()
    .min(1)
    .required()
})

const CreateBook = Joi.object({
  name: Joi.string()
    .min(1)
    .required()
})



books.get("/", async (req, res) => {
  let books = await db.table("books")
  res.send(books)
})

books.get("/:id", async (req, res) => {
  let { value, error } = GetBook.validate(req.params)

  if (error) {
    res.status(400)
    res.send(error)
    reutrn; 
  }

  let book = await db.table("books")
    .where("books.id", "=", value.id)
    .first()

  let borrows = await db.table("borrows")
    .where({book_id: book.id})
    .count({"borrow_count": "*"})
    .select(db.raw("COALESCE(avg(score), 0) as score"))
    .first();

  let already_borrowed = await db("borrows")
    .where({
      book_id: book.id,
      return_at: null
    })
    .first();

  book = {
    ...book,
    ...borrows,
    is_borrowed: already_borrowed != null,
    borrowed_at: already_borrowed ? dayjs(already_borrowed).toDate() : null
  }

  if (book == null) {

    res.status(404)
    res.send({
      error: "Book not found"
    })
    return;
  }
  res.send(book)
})

books.post("/", async (req, res) => {

  let { value, error } = CreateBook.validate(req.body)

  if (error) {
    res.status(400)
    res.send(error)
    return;
  }

  let [id]= await db.table("books").insert(value);

  res.send({
    id,
    ...value
  })
})


export default books
