import knex from 'knex';
import sqlite3 from "sqlite3"

let db = knex({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite',
  },
  useNullAsDefault: true

});

db.schema.createTableIfNotExists('users', function (table){
    table.increments()
    table.string('name')
  }).catch()

db.schema.createTableIfNotExists('books', function (table){
    table.increments()
    table.string('name')
  }).catch()

db.schema.createTableIfNotExists('borrows', function (table){
    table.increments()
    table.integer("book_id")
    table.integer("user_id")
    table.datetime("borrow_at")
    table.datetime("return_at")
    table.float("score")
  }).catch()

export default db
