import { userModel } from "../../../DB/Models/user.model.js"
import { taskModel } from "../../../DB/Models/task.model.js"


export const addTask = async (req, res) => {

    const { _id } = req.authUser
    const { title, description, deadline, assignTo } = req.body

    const userCheck = await userModel.findById(_id)
    if (!userCheck || _id == assignTo) {
        return res.status(404).json({ Message: "you can not assign this task to this employee" })
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    const currentDate = `${year}-${month}-${day}`


    if (deadline < currentDate) {
        return res.status(400).json({ message: "enter a valid date" })
    }

    const taskInstance = new taskModel({ title, description, deadline, assignTo, userId: _id })
    await taskInstance.save()

    res.status(201).json({
        Message: "task created", task: {
            title: taskInstance.title,
            description: taskInstance.description,
            assignTo: taskInstance.assignTo
        }
    })

}

export const updateTask = async (req, res) => {

    const { _id } = req.authUser
    const { taskId } = req.params
    const { title, description, status, deadline, assignTo } = req.body

    const taskCheck = await taskModel.findById(taskId)
    if (!taskCheck) {
        return res.status(404).json({ Message: "Enter a valid ID for task" })
    }
    const userCheck = await userModel.findById(_id)
    if (!userCheck || _id == assignTo) {
        return res.status(404).json({ Message: "In-valid account to take action on this task" })
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    const currentDate = `${year}-${month}-${day}`


    if (deadline < currentDate) {
        return res.status(400).json({ message: "enter a valid date" })
    }

    if (status !== "todo" && status !== "doing" && status !== "done") {
        return res.status(400).json({ message: "enter a valid status(todo , doing , done)" })
    }

    const updatedTask = await taskModel.findByIdAndUpdate(taskId, { title, description, status, deadline, assignTo })

    if (updatedTask) {
        return res.status(200).json({ Message: "task updated" })
    }

    res.status(409).json({ Message: "update fail" })

}

export const deleteTask = async (req, res) => {

    const { _id } = req.authUser
    const { taskId } = req.params

    const taskCheck = await taskModel.findById(taskId)
    if (!taskCheck) {
        return res.status(404).json({ Message: "Task not found" })
    }
    const userCheck = await userModel.findById(_id)
    if (!userCheck) {
        return res.status(404).json({ Message: "In-valid account to take action on this task" })
    }

    const deletedTask = await taskModel.findByIdAndDelete(taskId)

    if (deletedTask) {
        return res.status(200).json({ Message: "task deleted" })
    }

    res.status(409).json({ Message: "delete fail" })

}

export const getAllTasks = async (req, res) => {

    const taskCheck = await taskModel.find().populate([
        { path: 'userId', select: 'userName email' },
        { path: 'assignTo', select: 'userName email' }
    ])


    if (!taskCheck) {
        return res.status(404).json({ Message: "there are no Tasks have been created yet" })
    }


    res.status(200).json({ Message: "Done", taskCheck })

}

export const getAllCreatedTasks = async (req, res) => {

    const { _id } = req.authUser

    const userCheck = await userModel.findById(_id)
    if (!userCheck) {
        return res.status(404).json({ Message: "Enter a valid account or Id" })
    }

    const result = await taskModel.find({ userId: _id }).populate([
        { path: 'userId', select: 'userName email' },
        { path: 'assignTo', select: 'userName email' }
    ])

    res.status(200).json({ Message: "Done", result })
}

export const getAll_AssignTasks = async (req, res) => {

    const { _id } = req.authUser

    const userCheck = await userModel.findById(_id)
    if (!userCheck) {
        return res.status(404).json({ Message: "Enter a valid account or Id" })
    }

    const result = await taskModel.find({ assignTo: _id }).populate([
        { path: 'userId', select: 'userName email' },
        { path: 'assignTo', select: 'userName email' }
    ])

    res.status(200).json({ Message: "Done", result })
}

export const getAllLateTasks = async (req, res) => {
    const { _id } = req.authUser

    const userCheck = await userModel.findById(_id)
    if (!userCheck) {
        return res.status(404).json({ Message: "Enter a valid account or Id" })
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    const currentDate = `${year}-${month}-${day}`


    const result = await taskModel.find({
        $or: [{ assignTo: _id }, { userId: _id }],
        deadline: { $lt: currentDate }
    }).populate([
        { path: 'userId', select: 'userName email' },
        { path: 'assignTo', select: 'userName email' }
    ])

    res.status(200).json({ Message: "Done", result })
}