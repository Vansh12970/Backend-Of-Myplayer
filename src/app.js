import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
//limiting on json request (form)
app.use(express.json({limit: "20kb"}))
//url data encoder ({}) extended marji hai
app.use(express.urlencoded({extended: true, limit: "20kb"}))
//to store images on server and public available
app.use(express.static("public"))
app.use(cookieParser())


export { app }