"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const conversationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['direct', 'group'],
        required: true
    },
    name: String,
    participants: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    lastMessage: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Message"
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    avatar: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
conversationSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});
exports.default = (0, mongoose_1.model)('Conversation', conversationSchema);
