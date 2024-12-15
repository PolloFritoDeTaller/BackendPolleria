import { Router } from "express";
import { login, register, logout, verifyPassword, verifyToken, updateUser, refreshToken } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post('/register', register);
authRouter.put('/update', updateUser);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/verifyPassword', verifyPassword);
authRouter.post('/refresh-token', refreshToken);
authRouter.get('/verify-token', verifyToken);

export default authRouter;
