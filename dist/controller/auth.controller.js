"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const token_1 = require("../utils/token");
const registerUser = async (req, res) => {
    const { email, password, name, avatar } = req.body;
    console.log(req.body, 'THIS IS EGISTER USER');
    try {
        let user = await User_1.default.findOne({ email });
        if (user) {
            res.status(400).json({ success: false, msg: "User alredy exists" });
            return;
        }
        user = new User_1.default({
            email,
            password,
            name,
            avatar: avatar || ""
        });
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
        await user.save();
        const token = (0, token_1.genarateToken)(user);
        res.json({ success: true, token });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body, 'THIS IS EMAIL FROM LOGIN PAGE');
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ succes: false, msg: 'User not found' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, msg: "Invalid credentials" });
            return;
        }
        const token = (0, token_1.genarateToken)(user);
        res.json({
            success: true,
            token
        });
    }
    catch (error) {
    }
};
exports.loginUser = loginUser;
