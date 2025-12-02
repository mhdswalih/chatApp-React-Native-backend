"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("../dist/routes/auth.routes"));
const socket_1 = require("./socket/socket");
const PORT = process.env.PORT || 3000;
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/auth', auth_routes_1.default);
app.get("/", (req, res) => {
    res.send("/");
});
const server = http_1.default.createServer(app);
(0, socket_1.initializeSocket)(server);
(0, db_1.default)()
    .then(() => {
    console.log("Database connected");
    server.listen(PORT, () => {
        console.log("server is running", PORT);
    });
})
    .catch((error) => {
    console.log("Faild to start server due to database connection error", error);
});
