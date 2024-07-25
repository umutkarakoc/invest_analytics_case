import("dotenv/config")
import express from "express"
import bodyParser from "body-parser" 
import users from "./users.js" 
import books from "./books.js" 

const app = express()
app.use(bodyParser.json())

app.use("/users", users)
app.use("/books", books)

app.listen(process.env.PORT || 3000)
