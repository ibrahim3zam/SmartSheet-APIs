import joi from 'joi'
import { generalFields } from '../../Middlewares/validation.js'

export const AddTask = {
    body: joi.object({
        title: generalFields.title,
        description: generalFields.description,
        deadline: generalFields.deadline,
        assignTo: generalFields.userid
    }).required().options({ presence: 'required' })
}

export const UpdateTask = {
    body: joi.object({
        title: generalFields.title,
        description: generalFields.description,
        status: joi.string().valid('todo', 'doing', 'done'),
        deadline: generalFields.deadline,
        assignTo: generalFields.userid
    }).required().options({ presence: 'required' }),

    params: joi.object({
        taskId: generalFields.userid
    }).required().options({ presence: 'required' })
}

export const DeleteTask = {
    params: joi.object({
        taskId: generalFields.userid
    }).required().options({ presence: 'required' })
}