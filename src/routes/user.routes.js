import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"
import { loginUser } from "../controllers/user.controllers.js"
import { logoutUser } from "../controllers/user.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router()

//this route handle post type request

router.route("/register").post(
    //handle the images data
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

export default router