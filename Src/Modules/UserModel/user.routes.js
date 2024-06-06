import { Router } from "express";
const router = Router()
import * as uc from './user.controller.js'
import { asyncHandler } from "../../utils/asyncHandler.js";
import { isAuth } from "../../Middlewares/auth.js";
import { validationCoreFunction } from "../../Middlewares/validation.js";
import * as allSchemas from "./user.validationSchemas.js";
import { multerFunction } from "../../Services/multerLocally.js";
import { multerCloudFunction } from "../../Services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedFilesExtensions.js";



// ============  Method ==> POST
router.post('/signUp', validationCoreFunction(allSchemas.SignUpSchema), asyncHandler(uc.signUp))
router.post('/profile', isAuth, multerCloudFunction(allowedExtensions.Image).single('profile'), asyncHandler(uc.profile))
router.post(
    '/cover',
    isAuth,
    multerCloudFunction(allowedExtensions.Image).fields([
        { name: 'cover', maxCount: 1 },
        { name: 'image', maxCount: 2 },
    ]),
    asyncHandler(uc.coverPictures),
)


// ============  Method ==> GET
router.get('/', (req, res) => { res.json({ Message: "Welcome in User Module" }) })
router.get('/getUser/:userid', validationCoreFunction(allSchemas.GetUserSchema), isAuth, asyncHandler(uc.getUser))

router.get('/logIn',                 //=== URL& Method Layer
    validationCoreFunction(allSchemas.SignInSchema),        //=== Middleware Layers
    asyncHandler(uc.signIn))         //=== Controller Layer

router.get('/confirmEmail/:token', asyncHandler(uc.confirmEmail))

router.get('/Resubscribe/:token', asyncHandler(uc.reSubscribe))

router.get('/logOut',
    isAuth, validationCoreFunction(allSchemas.LogOutSchema),
    asyncHandler(uc.logOut))


// ============  Method ==> PATCH
router.patch('/changePassword',
    validationCoreFunction(allSchemas.ChangePassSchema), isAuth,
    asyncHandler(uc.changePassword))

router.patch('/unSubscribe',
    validationCoreFunction(allSchemas.unSubscribeSchema), isAuth,
    asyncHandler(uc.unSubscription))


router.patch('/softDeleteUser/:userid',
    isAuth, validationCoreFunction(allSchemas.SoftDeleteUserSchema),
    asyncHandler(uc.softDeleteUser))


// ============  Method ==> PUT
router.put('/updateUser',
    isAuth, validationCoreFunction(allSchemas.UpdateUserSchema),
    asyncHandler(uc.updateUser))


// ============  Method ==> DELETE
router.delete('/deleteUser/:userid',
    isAuth, validationCoreFunction(allSchemas.DeleteUserSchema),
    asyncHandler(uc.deleteUser))



export default router