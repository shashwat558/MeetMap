import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import client from "@repo/db/client"

export const userRouter = Router();

userRouter.post("/metadata", async(req, res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(403).json({message: "Validation failed"})
        return
    }
    await client.user.update({
        where:{
            id: req.userId
        }, 
        data:{
            avatarId: parsedData.data.avatarId
        }
    })
    res.json({message: "Metadata updated"})

})

userRouter.get("/metadata/bulk", (req, res) => {
    const userIds = req.query.ids;
    console.log(userIds);
    
    
})
