import { asyncHandler } from "../utils/asyncHandler.js";
// import api error file 
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
// import cloudinary file
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation all details in proper format
    // check if user already exist : username , email
    // check for images, check for avatar
    // if avaliable upload them to cloudinary, avtar check
    // create a user object to enter data in mongo db 
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const { fullName, email, username, password } = req.body

    // to check data come
    console.log("email: ", email)

    /* check conditions one by one
    if(fullName === "") {
        throw new ApiError(400, "fullname is required")
    }*/

    //check all condition using some() method which return boolean o/p
    if (
        [fullName, email, username, password].some((field) =>
        field?.trim() === "")
        //check if any field is empty
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
    //with help of $ you can use logical operators
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
// Multer give access of files
    const avtarLocalPath = req.files?.avtar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avtarLocalPath) {
        throw new ApiEroor(400, "Avtar file is required")
    }

    const avatar =  await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //check if avtar upload on cloudinary
    if (!avatar) {
        throw new ApiError(400, "Avatar file is requied")
    }
    
    //store in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }
//when user sucessfully created

    return res.status(201).json(
        new ApiResponse(200, createdUser, "UserRegistered Successfully")
    )
})


export { 
    registerUser,
 }