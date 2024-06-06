import joi from 'joi'
import { generalFields } from '../../Middlewares/validation.js'


export const SignUpSchema = {
    body: joi
        .object({
            userName: generalFields.userName,
            firstName: generalFields.firstName,
            lastName: generalFields.lastName,
            email: generalFields.email,
            password: generalFields.password,
            cpassword: generalFields.cpassword,
            gender: joi.string().valid('male', 'female', 'not specified'),
            age: joi.number().integer().min(1).max(120),
            phone: generalFields.phone
        })
        .required().options({ presence: 'required' }),
}

export const SignInSchema = {
    body: joi
        .object({
            password: generalFields.password,

            user: joi.alternatives().try(generalFields.userName, generalFields.email, generalFields.phone)

        })
        .required().options({ presence: 'required' }),
}

export const ChangePassSchema = {
    body: joi
        .object({
            userid: generalFields.userid,
            oldPassword: joi
                .string()
                .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{5,}$/)
                .messages({
                    'string.pattern.base': 'old Password regex fail',
                }),
            newPassword: joi
                .string()
                .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{5,}$/)
                .messages({
                    'string.pattern.base': 'new Password regex fail',
                }),
            cPassword: joi.valid(joi.ref('newPassword'))
        })
        .required().options({ presence: 'required' }),
}

export const UpdateUserSchema = {
    body: joi
        .object({
            firstName: generalFields.firstName,
            lastName: generalFields.lastName,
            age: joi.number().integer().min(1).max(120),
            userid: generalFields.userid,
        })
        .required().options({ presence: 'required' }),
}

export const DeleteUserSchema = {
    params: joi
        .object({
            userid: generalFields.userid,
        })
        .required().options({ presence: 'required' }),
}

export const SoftDeleteUserSchema = {
    params: joi
        .object({
            userid: generalFields.userid,
        })
        .required().options({ presence: 'required' }),
}

export const LogOutSchema = {
    body: joi
        .object({
            userid: generalFields.userid,
        })
        .required().options({ presence: 'required' }),
}

export const unSubscribeSchema = {
    body: joi
        .object({
            userEmail: generalFields.email,
        })
        .required().options({ presence: 'required' }),
}

export const GetUserSchema = {
    params: joi
        .object({
            userid: generalFields.userid,
        })
        .required().options({ presence: 'required' }),
}