"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserEvents = registerUserEvents;
const User_1 = __importDefault(require("../models/User"));
const token_1 = require("../utils/token");
function registerUserEvents(io, socket) {
    socket.on("testconnection", (data) => {
        socket.emit("testSocket", { msg: "its working!!" });
    });
    socket.on("updateProfile", async (data) => {
        const userId = socket.data.userId;
        if (!userId) {
            return socket.emit("updateProfile", {
                success: false,
                msg: "Unauthorized",
            });
        }
        try {
            const updatedUser = await User_1.default.findByIdAndUpdate(userId, { name: data.name, avatar: data.avatar }, { new: true });
            if (!updatedUser) {
                return socket.emit("updateProfile", {
                    success: false,
                    msg: "User not found",
                });
            }
            const newToken = (0, token_1.genarateToken)(updatedUser);
            socket.emit("updateProfile", {
                success: true,
                data: { token: newToken },
                msg: "Profile updated successfully"
            });
        }
        catch (error) {
            console.log("Error updating profile", error);
            socket.emit("updateProfile", {
                success: false,
                msg: "Error updating profile",
            });
        }
    });
    socket.on("getContacts", async () => {
        try {
            const currentUserId = socket.data.userId;
            if (!currentUserId) {
                socket.emit("getContacts", {
                    success: false,
                    msg: "Unauthorized",
                });
                return;
            }
            const users = await User_1.default.find({ _id: { $ne: currentUserId } }, { password: 0 }).lean();
            const contacts = users.map((user) => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar || "",
            }));
            socket.emit("getContacts", {
                success: true,
                data: contacts,
            });
        }
        catch (error) {
            console.log("getContactError : ", error);
            socket.emit("getContacts", {
                success: false,
                msg: "Failed to fetch contact",
            });
        }
    });
}
