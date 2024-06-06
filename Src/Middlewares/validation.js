import joi from 'joi'
const reqMethods = ['body', 'query', 'params', 'headers', 'file', 'files']


export const generalFields = {
    userid: joi
        .string()
        .hex()
        .length(24)
        .trim(),
    userName: joi
        .string()
        .min(3)
        .max(15)
        .regex(/^[a-zA-Z_-\s]*$/)
        .trim()
        .messages({
            'any.required': 'userName is required',
        }),
    firstName: joi.
        string()
        .min(3)
        .max(8)
        .regex(/^[a-zA-Z\s]*$/)
        .trim(),
    lastName: joi.
        string()
        .min(3)
        .max(8)
        .regex(/^[a-zA-Z\s]*$/)
        .trim(),
    email: joi
        .string()
        .email({ tlds: { allow: ['com', 'net', 'org'] } })
        .regex(/^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+(com|org|net)$/)
        .trim(),
    password: joi
        .string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{5,}$/)
        .messages({
            'string.pattern.base': 'Password regex fail',
        }),
    cpassword: joi.valid(joi.ref('password')),
    phone: joi.string().trim().pattern(/^[0-9]{11}/),
    title: joi.string().min(3).max(20).trim(),
    description: joi.string().min(5).max(100).trim(),
    deadline: joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}

export const validationCoreFunction = (schema) => {
    return (req, res, next) => {

        const validationErrorArr = []

        for (const key of reqMethods) {

            if (schema[key]) {

                const validationResult = schema[key].validate(req[key], {
                    abortEarly: false,
                })

                if (validationResult.error) {
                    validationErrorArr.push(validationResult.error.details)
                }
            }
        }

        if (validationErrorArr.length) {
            return res
                .status(400)
                .json({ message: 'Validation Error', Errors: validationErrorArr })
        }

        next()
    }
}