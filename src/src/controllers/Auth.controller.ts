import { Request, Response, Router } from "express";
import prismaconnection from "../db/prisma";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
export const signup= async (req: Request, res: Response): Promise<void> => {
    try {
        console.log(req.body)
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            res.status(400).json({ message: "All fields are required" });
            return
        }

        const checkuser=await prismaconnection.user.findFirst({
            where: {
                email: email,
            }
        });
        
        if (checkuser) {
            res.status(400).json({ message: "User already exists" });
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prismaconnection.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword
                }});
    const token = jwt.sign({userId: user.id }, process.env.JWT_SECRET_KEY||"BARCLAYS", {expiresIn: "10h"});
     
        res.status(200).json({ message: "Signin successful", token ,user: user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const signin = async (req: Request, res: Response) :Promise<void> => {
    try {
        console.log(req.body)
        const { username:name, password }:{ username: string; password: string } = req.body;
        const user = await prismaconnection.user.findUnique({
            where: { name },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            
            res.status(401).json({ message: "Invalid password" });
            return 
        }
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET_KEY || "BARCLAYS",
            { expiresIn: "1h" }
        );
        res.status(200).json({ message: "Signin successful", token, user });
        return
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
};


export const logout = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
