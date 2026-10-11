import express from 'express'
import { editProfile, getCurrentUser , getOtherUser, search } from '../controllers/userController.js'
import isAuth from '../middlewares/isAuth.js'
import {upload} from '../middlewares/multer.js'


const userRouter = express.Router()

userRouter.get('/current',isAuth, getCurrentUser)
userRouter.put('/profile',isAuth, upload.single('image'), editProfile)
userRouter.get("/others", isAuth , getOtherUser)
userRouter.get("/search", isAuth , search)
export default userRouter