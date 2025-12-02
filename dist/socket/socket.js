"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socket_io_1 = require("socket.io");
const userEvents_1 = require("./userEvents");
const chatEvents_1 = require("./chatEvents");
const Conversation_1 = __importDefault(require("../models/Conversation"));
dotenv_1.default.config();
function initializeSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*"
        }
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Autentication error : no token provided'));
        }
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (error, decoded) => {
            if (error) {
                return next(new Error("Authetication error : invalid token"));
            }
            let userData = decoded.user;
            socket.data = userData;
            socket.data.userId = userData.id;
            next();
        });
    });
    io.on('connect', async (socket) => {
        const userId = socket.data.userId;
        console.log(`User connected socket :${userId} ${socket.data.name}`);
        (0, chatEvents_1.registerChatEvents)(io, socket);
        (0, userEvents_1.registerUserEvents)(io, socket);
        try {
            const conversations = await Conversation_1.default.find({
                participants: userId
            }).select("_id");
            conversations.forEach((conversation) => {
                socket.join(conversation._id.toString());
            });
        }
        catch (error) {
            console.log('Error joining conversation', error);
        }
        socket.on('disconnect', (reason) => {
            console.log("user disconnected", userId, "reason:", reason);
        });
    });
    return io;
}
