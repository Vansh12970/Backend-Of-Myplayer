import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
},{timestamps : true})
                                    // in databse Subscription stores as subscriptions (small letters and plural)
export const Subscription = mongoose.model("Subscription", subscriptionSchema)