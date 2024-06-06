// import jwt from 'jsonwebtoken'
import { userModel } from '../../DB/Models/user.model.js'



export const isAuth = async (req, res, next) => {
    try {
        const { authorization } = req.headers
        if (!authorization) {
            return res.status(400).json({ message: 'Please login first' })
        }

        if (!authorization.startsWith('Trello')) {
            return res.status(400).json({ message: 'invalid token prefix' })
        }

        const splitedToken = authorization.split(' ')[1]

        try {
            // const decodedData = jwt.verify(
            //     splitedToken,
            //     process.env.LOGGED_IN_TOKEN_SIGNATURE,
            // )
            const decodedData = verifyToken({
                token: splitedToken,
                signature: process.env.LOGGED_IN_TOKEN_SIGNATURE,
            })

            const findUser = await userModel.findById(decodedData._id)
            if (!findUser) {
                return res.status(400).json({ message: 'Please SignUp' })
            }

            req.authUser = findUser
            return next()
        } catch (error) {

            if (error == 'TokenExpiredError: jwt expired') {

                const user = await userModel.findOne({ token: splitedToken })

                if (!user) {
                    return res.status(400).json({ Message: "Wrong Token" })
                }

                // const userToken = jwt.sign({ _id: user._id, userName: user.userName, email: user.email },
                //     process.env.LOGGED_IN_TOKEN_SIGNATURE,
                //     { expiresIn: "2d" })

                const userToken = generateToken({
                    payload: { _id: user._id, userName: user.userName, email: user.email },
                    signature: process.env.LOGGED_IN_TOKEN_SIGNATURE,
                    expiresIn: "2d",
                })

                if (!userToken) {
                    return next(
                        new Error('token generation fail, payload canot be empty', {
                            cause: 400,
                        }),
                    )
                }

                user.token = userToken
                await user.save()
                return res.status(201).json({ Message: "Token is refreshed", Token: userToken })
            }
            return res.status(400).json({ Message: "In-valid Token" })
        }

    } catch (error) {
        console.log(error);
        next(new Error('Catch error in authentication token layer', { cause: 500 }))
    }
}