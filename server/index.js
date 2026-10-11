import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRouter from './routes/authRoutes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import userRouter from './routes/userRoute.js'
import messageRouter from './routes/messageRoutes.js'
import { app, server } from './socket/socket.js'

dotenv.config()
const PORT = process.env.PORT


app.use(cors({origin:"http://localhost:5173", credentials:true}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/message', messageRouter)

server.listen(PORT, ()=>{
  connectDB()
  console.log(`server is running on ${PORT}`)
})