import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema({
    title: {
        type: String,
        require: true,
        trim: true
    },
    description: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        require: true,
        enum: ["todo", "doing", "done"],
        default: "todo"
    },
    deadline: {
        type: Date,
        require: true,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'user'
    },
    assignTo: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'user'
    }
}, {
    timestamps: true
})

export const taskModel = mongoose.model('task', taskSchema)