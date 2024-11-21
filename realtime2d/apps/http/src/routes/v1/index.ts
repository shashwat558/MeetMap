import { json, Router } from "express";
import { SigninSchema, SignupSchema } from "../../types";
import client from "@repo/db/client";
import  {userRouter} from "./user"
import  {spaceRouter} from "./space"
import  {adminRouter} from "./admin"
import { hash, compare } from "../../scrypt";
import  jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import { userAuthMiddleware } from "../../middleware/user";
import { adminAuthMiddleware } from "../../middleware/admin";





export const router = Router();

router.post("/signup", async(req, res) => {
    console.log(req.body)
    const parsedUserData = SignupSchema.safeParse(req.body);
    

    if(!parsedUserData.success){
        console.log("dgfdl")
        console.log(req.body)
        res.status(400).json({message: "Failed Validation"})
        return 

    }

    const hashedPassword = await hash(parsedUserData.data.password);
    try {
        const user = await client.user.create({
            data:{
                username: parsedUserData.data.username,
                password: hashedPassword,
                role: parsedUserData.data.type === "admin" ? "Admin" : "User",
                
            }
        })
        res.json({
           userId: user.id
            
        })

        
    } catch (error) {
        res.status(400).json({message: "User already exists"})
        
    }

})

router.post("/signin", async (req, res) => {
    const parsedUserData = SigninSchema.safeParse(req.body);
    if(!parsedUserData.success){
         res.status(400).json({message: "Validation failed"})
         return
    }
    try {
        const user = await client.user.findFirst({
            where:{
                username: parsedUserData.data.username
            }
        })
        if(!user){
            res.status(400).json({message:"User does not exist. please signup"})
            return
        }
        //@ts-ignore
        const isValid = await compare(parsedUserData.data.password, user.password)
        if(!isValid){
            res.status(403).json({message: "Invalid password"})
            return
        }
        const token =  jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_SECRET)

        res.json({
            token
        })



    } catch (error) {
        console.log(error)
    }

})


router.get('/elements', async(req, res) => {
    const elements = await client.element.findMany();
    res.json({elements: elements.map(e => ({
        id: e.id,
        imageUrl: e.imageUrl,
        height: e.height,
        width: e.width,
        static: e.static
    }))});
     
})

router.get('/avatars', async (req, res) => {
    const avatars = await client.avatar.findMany();

    res.json({
        avatars:avatars.map(avatar => ({
            id: avatar.id,
            imageUrl: avatar.imageUrl,
            name: avatar.name
        }))
    })
     
})


router.use("/user",userAuthMiddleware,userRouter);
router.use("/space", spaceRouter);
router.use("/admin",adminAuthMiddleware, adminRouter);