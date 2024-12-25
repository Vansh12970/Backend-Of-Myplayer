import { asyncHandler } from "../utils/asyncHandler.js";
// import api error file 
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
// import cloudinary file
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        //generating tokens by methods define in user models
        const user =  await User.findById(userId)
        const accessToken = user.generateAcessToken()
        const refreshToken = user.generateRefreshToken()

        //add thegenerate token in user model
        user.refreshToken = refreshToken
        //don't check any necessry requirement define in user model
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

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
    // console.log("email: ", email)

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
//console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;
//  const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage)
    && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path}


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avtar file is required")
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

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find user
    // password checks
    // access and refresh token
    // send cookie
    const {email, username, password} = req.body

    if(!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }
// findOne is mongodb method and use with only database (User)
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid Password")
    }

    const {accessToken, refreshToken} = await
    generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    //make cookies that doesn't modify using frontend only modifiable by server
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res 
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

// convert incoming token from user to decoded token
 try {
       const decodedToken = jwt.verify(
           incomingRefreshToken,
           process.env.REFRESH_TOKEN_SECRET,
       )
   
       const user = await User.findById(decodedToken?._id)
   
       if (!user) {
           throw new ApiError(401, "Invalid refresh token")
       }
   
       if (incomingRefreshToken !== user?.refreshToken) {
           throw new ApiError(401, "Refresh Token is expired")
       }
        
       const options = {
           httpOnly:true,
           secure: true
       }
       
       const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
   
       return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", newRefreshToken,options)
       .json(
           new ApiResponse(
               200,
               {accessToken, refreshToken: newRefreshToken},
               "Access token refreshed"
           )
       )
 } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token")
 }
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
 }