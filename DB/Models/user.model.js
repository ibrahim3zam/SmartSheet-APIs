import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'not specified'],
        required: true,
        default: 'not specified'
    },
    phone: {
        type: String,
        required: true,
        minlength: 11,
        maxlength: 11
    },
    profile_pic: {
        secure_url: String,
        public_id: String
    },

    coverPictures: [{
        secure_url: String,
        public_id: String
    }],
    token: {
        type: String,
        default: ''
    },
    isDeleted: {
        type: String,
        enum: ['true', 'false'],
        required: true,
        default: 'false'
    },
    isOnline: {
        type: String,
        enum: ['true', 'false'],
        required: true,
        default: 'true'
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    subscribtionStatus: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

export const userModel = mongoose.model('user', userSchema)