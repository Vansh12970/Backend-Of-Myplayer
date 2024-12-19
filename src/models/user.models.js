import mongoose, {Schema} from mongoose;
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avtar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "video",
            }
        ],
        password: {
            type: String,
            required :[ true, "Password is required"]
        },
        refreshToken: {
            type: string
        },
    }, {
        timestamps: true
    })

//data save honey se pheley password encrypt karna
userSchema.pre("save", async function (next) {
    // if password doesn't change then out from here to next()
    if(!this.isModefied("password")) return next();

    // if password change encrypt again
    this.password = bcrypt.hash(this.password, 10)
    next()
} )

userSchema.methods.isPasswordCorrect = async function 
(password) {
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAcessToken = function (){
  return  jwt.sign(
    {
        _id:this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = function (){
    return  jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    }


export const User = mongoose.model("User", userSchema)