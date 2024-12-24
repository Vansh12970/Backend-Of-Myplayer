import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

//this route handle post type request

router.route("/register").post(
    //handle the images data
    upload.fileds([
        {
            name: "avtar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
)



export default router