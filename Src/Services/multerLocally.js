import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { customAlphabet } from 'nanoid'
import { allowedExtensions } from '../utils/allowedFilesExtensions.js'

const nanoid = customAlphabet('123456_=!ascbhdtel', 5)
// import { nanoid } from 'nanoid'


export const multerFunction = (allowedExtensionsArr, customPath) => {

    if (!allowedExtensionsArr) {
        allowedExtensionsArr = allowedExtensions.Image
    }
    if (!customPath) {
        customPath = 'General'
    }

    //================================== Custom Path =============================

    const destPath = path.resolve(`uploads/${customPath}`)

    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true })
    }

    //================================== Storage =============================
    const storage = multer.diskStorage({
        // destination
        destination: function (req, file, cb) {
            cb(null, destPath)
        },
        //filename
        filename: function (req, file, cb) {
            const uniqueFileName = nanoid() + file.originalname

            //   console.log({
            //     original: file.originalname,
            //     uniqueFileName,
            //   })

            cb(null, uniqueFileName)
        },
    })

    //================================== File Filter =============================
    const fileFilter = function (req, file, cb) {

        if (allowedExtensionsArr.includes(file.mimetype)) {
            return cb(null, true)
        }
        cb(new Error('invalid extension', { cause: 400 }), false)
    }

    const fileUpload = multer({
        fileFilter,
        storage,
        // limits: {
        //   //   fields: 2,
        //   //   files: 2,
        // },
    })
    return fileUpload
}

