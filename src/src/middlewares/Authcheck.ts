import { NextFunction,  Response, Request } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
declare global {
    namespace Express {
      interface Request {
        userId?: string;
      }
    }
  }
export const authenticate =async (req: Request, res: Response, next: NextFunction) => {
    try {
        const header=req.headers["authorization"]
        if(!header){
            res.status(401).json({message:"Unauthorized"})
            return
            }
            const decoded=jwt.verify(header,process.env.JWT_SECRET_KEY||"BARCLAYS");
            if(!decoded){
                res.status(401).json({message:"Unauthorized"})
                return 
                }
                if (!decoded || typeof decoded !== "object" || !decoded.userId) {
                    res.status(401).json({ message: "Unauthorized: Invalid token" });
                    return 
                  }
                req.userId=decoded.userId 
                next();
        
    } catch (error) {
        res.status(401).json({message:"Unauthorized"})
        return 
    }

}