import { Router } from "express";
const router = Router()
import * as tc from './task.controller.js'
import { asyncHandler } from "../../utils/asyncHandler.js";
import { isAuth } from "../../Middlewares/auth.js";
import { validationCoreFunction } from "../../Middlewares/validation.js";
import * as allSchemas from './task.validationSchemas.js'



// ============= Method : GET
router.get('/', (req, res) => { res.json({ Message: "Welcome in Task Module" }) })


// ============= Method : POST
router.post('/addTask', validationCoreFunction(allSchemas.AddTask), isAuth, asyncHandler(tc.addTask))

// ============= Method : GET
router.get('/getAllTasks', asyncHandler(tc.getAllTasks))
router.get('/getAllCreatedTasks', isAuth, asyncHandler(tc.getAllCreatedTasks))
router.get('/getAll_AssignTasks', isAuth, asyncHandler(tc.getAll_AssignTasks))
router.get('/getAllLateTasks', isAuth, asyncHandler(tc.getAllLateTasks))

// ============= Method : PUT
router.put('/updateTask/:taskId', validationCoreFunction(allSchemas.UpdateTask), isAuth, asyncHandler(tc.updateTask))


// ============= Method : DELETE
router.delete('/deleteTask/:taskId', validationCoreFunction(allSchemas.DeleteTask), isAuth, asyncHandler(tc.deleteTask))

export default router