import { Router } from "express";
import { signup,signin,logout } from "../controllers/Auth.controller";
const Authrouter=Router();
    Authrouter.post("/signup",signup)
    Authrouter.post("/login",signin)
    Authrouter.post("/logout",logout)
export default Authrouter;