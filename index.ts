import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRouter from '../Backend/routes/auth.routes'
import { initializeSocket } from './socket/socket';
const PORT = process.env.PORT || 3000
dotenv.config();

const app = express()

app.use(express.json());
app.use(cors());

app.use('/auth',authRouter)

const server = http.createServer(app);
initializeSocket(server)
connectDB()
.then(() => {
    console.log("Database connected");
    
    server.listen(PORT,()=>{
        console.log("server is running",PORT); 
    })
})
.catch((error) => {
    console.log("Faild to start server due to database connection error",error);
    
})