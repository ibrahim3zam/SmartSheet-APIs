import { userModel } from "../../../DB/Models/user.model.js"
import bcrypt from 'bcrypt'
import { sendEmailService } from "../../Services/sendEmailService.js"
import cloudinary from '../../utils/cloudinaryConfig.js'
import { generateQrcode } from "../../utils/QRcodeFunction.js"
import { generateToken, verifyToken } from "../../utils/tokenFunctions.js"


export const signUp = async (req, res, next) => {
    const { firstName, lastName, userName, email
        , password, cpassword, age, gender, phone } = req.body

    const isExist = await userModel.findOne({ $or: [{ phone }, { email }, { userName }] })
    if (isExist?.email == email) {
        return res.status(400).json({ message: "email already exist" })
    }
    if (isExist?.phone == phone) {
        return res.status(400).json({ message: "phone already exist" })
    }
    if (isExist?.userName == userName) {
        return res.status(400).json({ message: "userName already exist" })
    }

    if (password !== cpassword) {
        return res.status(400).json({ message: "confirmation Password is not compatible" })
    }


    // const token = jwt.sign({ email }, process.env.CONFIRMED_EMAIL_SIGNATURE, { expiresIn: '1h' })
    const token = generateToken({
        payload: { email },
        signature: process.env.CONFIRMED_EMAIL_SIGNATURE,
        expiresIn: '1h'
    })
    if (!token) {
        return next(
            new Error('token generation fail, payload canot be empty', {
                cause: 400,
            }),
        )
    }

    const confirmLink = `${req.protocol}://${req.headers.host}/trello/user/confirmEmail/${token}`

    const message = `<a href=${confirmLink}> Click Here to confirm your email </a>`


    const isEmailSent = await sendEmailService({
        to: email,
        message,
        subject: 'Verification Sunject email',
    })

    if (!isEmailSent) {
        return res.status(500).json({ Message: "Please try again later or contact support team" })
    }

    const hashedPassword = bcrypt.hashSync(password, parseInt(process.env.SALT_OR_ROUNDS))

    const newUser = new userModel({
        firstName, lastName, userName, email
        , password: hashedPassword, age, gender, phone
    })


    await newUser.save()
    const result = await userModel.findByIdAndUpdate(newUser._id, { isOnline: false })
    res.status(201).json({
        message: "Done", result
    })
}

export const confirmEmail = async (req, res) => {
    const { token } = req.params
    const decodedData = jwt.verify(token, process.env.CONFIRMED_EMAIL_SIGNATURE)

    const isUserConfirmed = await userModel.findOne({ email: decodedData.email })

    if (isUserConfirmed.isConfirmed) {
        return res.status(400).json({ Message: "you are already confirmed " })
    }

    const user = await userModel.findOneAndUpdate({ email: decodedData.email },
        { isConfirmed: true }, { new: true })

    res.status(200).json({ Message: "Confirmed Done please try to log in", user })

}

export const signIn = async (req, res, next) => {

    const { user, password } = req.body

    const isExist = await userModel.findOne({
        $or: [
            { userName: user },
            { email: user },
            { phone: user }
        ]
    })

    if (!isExist.isConfirmed) {
        return res.status(400).json({ message: "Please confirm your email and try again" })
    }
    if (!isExist) {
        return res.status(400).json({ message: "In-valid user or password" })
    }

    if (isExist.isDeleted == "true") {
        await userModel.findByIdAndUpdate(isExist._id, { isDeleted: "false" })
    }

    if (isExist.isOnline !== "true") {
        await userModel.findByIdAndUpdate(isExist._id, { isOnline: "true" })
    }

    const isPassMatching = bcrypt.compareSync(password, isExist.password)

    if (isPassMatching) {

        // const userToken = jwt.sign({ _id: isExist._id, userName: isExist.userName, email: isExist.email },
        //     process.env.LOGGED_IN_TOKEN_SIGNATURE,
        //     { expiresIn: "20" })

        const userToken = generateToken({
            payload: { _id: isExist._id, userName: isExist.userName, email: isExist.email },
            signature: process.env.LOGGED_IN_TOKEN_SIGNATURE,
            expiresIn: '1h'
        })
        if (!userToken) {
            return next(
                new Error('token generation fail, payload canot be empty', {
                    cause: 400,
                }),
            )
        }

        isExist.token = userToken
        await isExist.save()

        return res.status(200).json({ Message: "Logged in", userToken })
    }

    res.status(400).json({ message: "In-valid user or password" })

}

export const getUser = async (req, res, next) => {
    const { _id } = req.authUser
    const { userid } = req.params

    const user = await userModel.findById(_id, 'userName email')

    if (user._id.toString() != userid.toString()) {
        return next(new Error('Un-auth', { cause: 400 }))
    }
    const qrcode = await generateQrcode(user)

    res.status(200).json({ Message: "Done", user, result: qrcode })


}

export const changePassword = async (req, res) => {

    const { _id } = req.authUser
    const { userid, oldPassword, newPassword, cPassword } = req.body

    const userCheck = await userModel.findById(userid)

    if (!userCheck) {
        return res.status(404).json({ Message: "in-valid credential" })
    }

    if (userCheck._id.toString() != _id.toString()) {
        return res.status(401).json({ Message: "Unauthorizsed Account" })
    }

    if (userCheck.isDeleted == "true") {
        return res.status(400).json({ Message: "you have to recover your account after Soft delete has been done" })
    }

    const isPassMatching = bcrypt.compareSync(oldPassword, userCheck.password)
    if (!isPassMatching) {
        return res.status(400).json({ Message: "Old password is not correct" })
    }

    if (userCheck.isOnline !== "true") {
        return res.status(400).json({ Message: "you have to sign in first" })
    }

    if (newPassword !== cPassword) {
        return res.status(400).json({ message: "confirmation Password is not compatible" })
    }


    const hashedPassword = bcrypt.hashSync(newPassword, parseInt(process.env.SALT_OR_ROUNDS))

    const updatedData = await userModel.findByIdAndUpdate(userid,
        { password: hashedPassword }, { new: true })

    if (updatedData) {
        return res.status(200).json({ Message: "Update is successful" })
    }

    res.status(409).json({ Message: "update fail" })

}

export const updateUser = async (req, res) => {

    const { _id } = req.authUser
    const { userid, firstName, lastName, age } = req.body

    const userCheck = await userModel.findById(userid)

    if (!userCheck) {
        return res.status(404).json({ Message: "in-valid credential" })
    }

    if (userCheck._id.toString() !== _id.toString()) {
        return res.status(401).json({ Message: "Unauthorizsed Account" })
    }

    if (userCheck.isDeleted == "true") {
        return res.status(400).json({ Message: "you have to recover your account after Soft delete has been done" })
    }

    if (userCheck.isOnline !== "true") {
        return res.status(400).json({ Message: "you have to sign in first" })
    }

    const updatedData = await userModel.
        findByIdAndUpdate(userid, {
            age, firstName, lastName,
            userName: `${firstName}_${lastName}`
        }, { new: true })

    if (updatedData) {
        return res.status(200).json({ Message: "Update is successful" })
    }

    res.status(409).json({ Message: "update fail" })


}

export const deleteUser = async (req, res) => {

    const { _id } = req.authUser
    const { userid } = req.params

    const userCheck = await userModel.findById(userid)

    if (!userCheck) {
        return res.status(404).json({ Message: "in-valid credential" })
    }

    if (userCheck._id.toString() !== _id.toString()) {
        return res.status(401).json({ Message: "Unauthorizsed Account" })
    }

    if (userCheck.isDeleted == "true") {
        return res.status(400).json({ Message: "you have already delete your account recover it if you want" })
    }

    if (userCheck.isOnline !== "true") {
        return res.status(400).json({ Message: "you have to sign in first" })
    }

    const deletedData = await userModel.findByIdAndDelete(userid)

    if (deletedData) {
        return res.status(200).json({ Message: "deletion is Done" })
    }

    res.status(409).json({ Message: "delete fail" })

}

export const softDeleteUser = async (req, res) => {

    const { _id } = req.authUser
    const { userid } = req.params

    const userCheck = await userModel.findById(userid)

    if (!userCheck) {
        return res.status(404).json({ Message: "in-valid credential" })
    }

    if (userCheck._id.toString() !== _id.toString()) {
        return res.status(401).json({ Message: "Unauthorizsed Account" })
    }

    if (userCheck.isDeleted == "true") {
        return res.status(400).json({ Message: "you have already delete your account recover it if you want" })
    }

    if (userCheck.isOnline !== "true") {
        return res.status(400).json({ Message: "you have to sign in first" })
    }

    const SoftDeletedUser = await userModel.findByIdAndUpdate(userid,
        {
            isDeleted: true,
            isOnline: false
        })

    if (SoftDeletedUser) {
        return res.status(200).json({ Message: "deletion is Done" })
    }

    res.status(409).json({ Message: "delete fail" })

}

export const logOut = async (req, res) => {

    const { _id } = req.authUser
    const { userid } = req.body

    const userCheck = await userModel.findById(userid)

    if (!userCheck) {
        return res.status(404).json({ Message: "in-valid credential" })
    }

    if (userCheck._id.toString() !== _id.toString()) {
        return res.status(401).json({ Message: "Unauthorizsed Account" })
    }

    if (userCheck.isDeleted == "true") {
        return res.status(400).json({ Message: "you have already delete your account recover it if you want" })
    }

    if (userCheck.isOnline !== "true") {
        return res.status(400).json({ Message: "you have to sign in first" })
    }

    await userModel.findByIdAndUpdate(userCheck._id, { isOnline: false })
    res.status(200).json({ Message: "you are logged out" })

}

export const unSubscription = async (req, res, next) => {
    const { email } = req.authUser
    const { userEmail } = req.body

    const userCheck = await userModel.findOne({ email: userEmail })

    if (!userCheck) {
        return res.status(400).json({ Message: "In-valid request Email" })
    }

    if (userCheck.email !== email) {
        return res.status(401).json({ Message: "Unauthorizsed Account" })
    }

    const updateData = await userModel.findOneAndUpdate({ email: userCheck.email },
        { subscribtionStatus: false }, { new: true })

    if (!updateData) {
        return res.status(404).json({ Message: "please try again" })
    }

    // const token = jwt.sign({ email }, process.env.RESUBSCRIBE_SIGNATURE, { expiresIn: '1h' })
    const token = generateToken({
        payload: { email },
        signature: process.env.RESUBSCRIBE_SIGNATURE,
        expiresIn: '1h'
    })
    if (!token) {
        return next(
            new Error('token generation fail, payload canot be empty', {
                cause: 400,
            }),
        )
    }

    const resubscribeLink = `${req.protocol}://${req.headers.host}/trello/user/Resubscribe/${token}`

    const message = `<a href=${resubscribeLink}>Reactivate subscribtion</a>`


    const isEmailSent = await sendEmailService({
        to: email,
        message,
        subject: 'Confirmed Unsubscribtion mail',
    })

    if (!isEmailSent) {
        return res.status(500).json({ Message: "Please try again later or contact support team" })
    }

    res.status(200).json(updateData)

}

export const reSubscribe = async (req, res) => {
    const { token } = req.params
    // const decodedData = jwt.verify(token, process.env.RESUBSCRIBE_SIGNATURE)
    const decodedData = verifyToken({
        token,
        signature: process.env.RESUBSCRIBE_SIGNATURE,
    })
    if (!decodedData) {
        return next(
            new Error('token decode fail, invalid token', {
                cause: 400,
            }),
        )
    }

    const isUserSubscribed = await userModel.findOne({ email: decodedData.email })

    if (isUserSubscribed.subscribtionStatus) {
        return res.status(400).json({ Message: "you are already subscribed" })
    }

    const user = await userModel.findOneAndUpdate({ email: decodedData.email },
        { subscribtionStatus: true }, { new: true })

    res.status(200).json({ Message: "reSubscrib Done", user })
}

export const profile = async (req, res, next) => {
    const { _id } = req.authUser

    if (!req.file) {
        return next(new Error('please upload profile picture', { cause: 400 }))
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path,
        {
            folder: `Users/profile/${_id}`,
            // public_id:``,
            resource_type: 'image',
            use_filename: true,
            unique_filename: false
        }
    )

    const user = await userModel.findByIdAndUpdate(
        _id,
        { profile_pic: { secure_url, public_id } },
        { new: true })

    if (!user) {
        await cloudinary.uploader.destroy(public_id) // delete one file
        // await cloudinary.api.delete_resources([publicIds])  delete bulk of files
    }

    res.status(200).json({ message: 'Done', user })
}

export const coverPictures = async (req, res, next) => {
    const { _id } = req.authUser
    if (!req.files) {
        return next(new Error('please upload pictures', { cause: 400 }))
    }
    // console.log(req.files)
    const coverImages = []
    for (const file in req.files) {
        // console.log(file)  image , cover
        // console.log(req.files[file])
        for (const key of req.files[file]) {
            // console.log(key)
            const { secure_url, public_id } = await cloudinary.uploader.upload(key.path,
                {
                    folder: `Users/covers/${_id}`,
                    resource_type: 'image',
                    use_filename: true,
                    unique_filename: false
                }
            )
            coverImages.push({ secure_url, public_id })
        }
    }
    const user = await userModel.findById(_id)

    // if(!user) await cloudinary.api.delete_resources()
    user.coverPictures.length
        ? coverImages.push(...user.coverPictures)
        : coverImages

    const userNew = await userModel.findByIdAndUpdate(
        _id,
        {
            coverPictures: coverImages,
        },
        {
            new: true,
        },
    )
    res.status(200).json({ message: 'Done', userNew })
}