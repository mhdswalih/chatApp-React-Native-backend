"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genarateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const genarateToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};
exports.genarateToken = genarateToken;
