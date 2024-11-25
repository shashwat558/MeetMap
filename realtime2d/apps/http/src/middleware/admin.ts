import { NextFunction, Request, Response } from "express";
import jwt, { decode }  from "jsonwebtoken";
import { JWT_SECRET } from "../config";



export const adminAuthMiddleware = (req:Request, res:Response, next:NextFunction) => {
    console.log("admin middleware hit")
    const header = req.headers["authorization"];
    const token = header?.split(" ")[1];
    if(!token){
        res.status(403).json({message: "unauthorized"})
        return
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {role: string, userId: 
        string}
        if(decoded.role !== "Admin"){
            res.status(403).json({message: "Unauthenticated"})
            return

        }
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(403).json({message: "unauthorized"})
        return
        
    }
        


}