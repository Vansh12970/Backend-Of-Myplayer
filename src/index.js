//require('dotenv').config({path: './env'})
//import 'dotenv/config'
//new method of uper line and changes in package.json script
import dotenv from "dotenv";
import connectDB from "./db/index.js";

// Load environment variables
dotenv.config({
    path: './env',
});

// Connect to the database
connectDB();




















//import mongoose from "mongoose";
//import {DB_NAME} from "./constants";
/*
// basic approch
import express from "express"
const app = express()
//iife function ()() to connect immediately to db
(async () => {
    try {
        await mongoose.connect(`${process.env.
            MONGODB_URL}/${DB_NAME}`) 
            app.on("error", (error) => {
                  console.log("ERROR APP NOT ABLE TO TALK TO DATABASE : ", error);
                  throw error
            })

            app.listen(process.env.PORT, () => {
                console.log(`App is listening on post ${process.env.PORT}`)
            })
    } catch (error) {
        // work as console.log log replace with error
        console.error("ERROR: ", error)
    }
})() */