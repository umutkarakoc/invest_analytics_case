import db from "./db.js"
import express from "express"
import Joi from "joi"
import { nanoid } from "nanoid"
import dayjs from "dayjs"

const users = express()

const GetUser = Joi.object({
  id: Joi.string()
    .min(1)
    .required()
})
const CreateUser = Joi.object({
  name: Joi.string()
    .min(1)
    .required()
})

users.get("/", async (req, res) => {
  let users = await db.table("users");
  res.send(users)
})

users.get("/:id", async (req, res) => {
  let { value, error } = GetUser.validate(req.params)

  if (error) {
    res.status(400)
    res.send(error)
    return;
  }

  let user = await db
    .table("users")
    .where("id", "=", value.id)
    .first();

  if (user == null) {

    res.status(404)
    res.send({
      error: "User not found"
    })
    return;

  }
  res.send(user)
})

users.post("/", async (req, res) => {

  let { value, error } = CreateUser.validate(req.body)

  if (error) {
    res.status(400)
    res.send(error)
    return;
  }

  let [id] = await db.table("users").insert(value)

  res.send({
    id,
    ...value
  })
})


/* borrows */
const Borrow = Joi.object({
  userId: Joi.string()
    .min(1)
    .required(),
  bookId: Joi.string()
    .min(1)
    .required()
})

const Return = Joi.object({
  userId: Joi.string()
    .min(1)
    .required(),
  bookId: Joi.string()
    .min(1)
    .required(),
  score: Joi.number()
    .min(0)
    .max(10)
    .required()
})

users.post("/:userId/borrow/:bookId", async (req, res) => {
  let { value, error } = Borrow.validate(req.params)

  if (error) {
    res.status(400)
    res.send(error)
    return;
  }

  let already_borrowed = await db("borrows")
    .where({
      book_id: value.bookId,
      return_at: null
    })
    .first();

  if (already_borrowed) {
    res.status(400)
    res.send({
      error: "This book already borrowed"
    })
    return;

  }

  let user = await db("users")
    .where({ id: value.userId })
    .first()


  if (user == null) {
    res.status(400)
    res.send({
      error: "User not found"
    })
    return;
  }

  let book = await db.table("books").where("id", "=", value.bookId).first()

  if (book == null) {

    res.status(404)
    res.send({
      error: "Book not found"
    })
    return;
  }

  let borrow = {
    borrow_at: dayjs().toDate(),
    user_id: user.id,
    book_id: book.id
  }

  let [id] = await db.table("borrows").insert(borrow)

  res.send({
    id,
    ...borrow
  })


})
users.post("/:userId/return/:bookId", async (req, res) => {
  let { value, error } = Return.validate({ ...req.params, ...req.body })

  if (error) {
    res.status(400)
    res.send(error)
    return;
  }

  let borrow = await db("borrows")
    .where({
      user_id: value.userId,
      book_id: value.bookId,
      return_at: null
    })
    .first();

  if (borrow == null) {
    res.status(400)
    res.send({
      error: "Borrow not found"
    })
    return;

  }

  let return_at = dayjs().toDate();

  await db.table("borrows")
    .where({ id: borrow.id })
    .update({ return_at, score: value.score })

  res.send({
    ...borrow,
    return_at,
    borrow_at: dayjs(borrow.borrow_at).toDate(),
    score: value.score,
  })


})

export default users
