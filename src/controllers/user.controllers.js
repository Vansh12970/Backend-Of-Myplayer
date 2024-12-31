import { asyncHandler } from "../utils/asyncHandler.js";
// import api error file 
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
// import cloudinary file
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import {v2 as cloudinary} from "cloudinary"


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        //generating tokens by methods define in user models
        const user =  await User.findById(userId)
        const accessToken = user.generateAcessToken()
        const refreshToken = user.generateRefreshToken()

        //add the generate token in user model
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
//this avatarLocalPath work as it is a required file
    const avatarLocalPath = req.files?.avatar[0]?.path;
// this col doesn't work with coverImageLocalPath as it is not compulsary field
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
            $unset: {
                refreshToken : 1 //this remove field from document
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

    if (!incomingRefreshToken) {
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
               "Access token Refreshed"
           )
       )
 } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token")
 }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
   
    const isPasswordCorrect = await user.
    isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})
    
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched Successfully"))

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email) {
        throw new ApiError(400, "All fields required")
    }

const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName: fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details successfully updated"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary
    (avatarLocalPath)

    if(!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Uploaded Successfully"))
})

// To remove avatar from database and cloudinary together
const removeOldAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)

    if(!user.avatar) {
        throw new ApiError(400, "No Avatar found")
    }

    user.avatar = ""
    await user.save();

    return res
    .status(200)
    .json(new ApiResponse(200, "", "Old Avatar removed successfully"))
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary
    (coverImageLocalPath)

    if(!coverImage.url) {
        throw new ApiError(400, "Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Uploaded Successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res)=> {

    const {username} =req.params

    if(!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }
// writing aggregation pipelines
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions", //foreign data model
                localField: "_id",     // local data model (user) to aggregate
                foreignField: "channel", // foreign data to aggregate
                as: "subscribers"   // call the aggregation by
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        { // fields add in user model 
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        // use to check itself is present subscribers
                        then: true,
                        else: false,
                    }
                }
            }
        },
        { // values with 1 written can send to model
            $project: {
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar:1,
                coverImage: 1,
                email: 1
            }
        }
]);

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                //by _id we get a string of id
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            user[0].watchHistory, "Watch History Fetched Successfully"
        )
    )
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    removeOldAvatar,
    getUserChannelProfile,
    getWatchHistory,
 }