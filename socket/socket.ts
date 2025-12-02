import dotenv from 'dotenv';
import   jwt  from 'jsonwebtoken';
import { Server as SocketIOServer , Socket} from 'socket.io';
import { registerUserEvents } from './userEvents';
import { registerChatEvents } from './chatEvents';
import Conversation from '../models/Conversation';

dotenv.config()

export function initializeSocket(server:any) : SocketIOServer {
    const io = new SocketIOServer(server, {
        cors : {
            origin : "*"
        }
    })
    io.use((socket : Socket,next) => {
        const token = socket.handshake.auth.token;
        if(!token){
            return next(new Error('Autentication error : no token provided'))
        }
        jwt.verify(token,process.env.JWT_SECRET as string,(error : any,decoded : any) => {
            if(error){
                return next(new Error("Authetication error : invalid token"))
            }
            let userData = decoded.user 
            socket.data = userData;
            socket.data.userId = userData.id
            next()
        })
    })
    io.on('connect',async(socket : Socket) =>{
        const userId = socket.data.userId;
        console.log(`User connected socket :${userId} ${socket.data.name}`);

        registerChatEvents(io,socket);
        registerUserEvents(io,socket);

        try {
            const conversations = await Conversation.find({
                participants : userId
            }).select("_id")
            
            conversations.forEach((conversation) => {
                socket.join(conversation._id.toString())
            })

        } catch (error) {
            console.log('Error joining conversation',error);
            
        }
        
        socket.on('disconnect',(reason)=>{
            console.log("user disconnected",userId, "reason:", reason);
        })

    })
    return io
}