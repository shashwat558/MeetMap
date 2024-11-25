import { Router } from "express";
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../types";
import client from "@repo/db/client"

export const adminRouter = Router();


adminRouter.post("/element", async(req, res) => {
    const parsedData = CreateElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message: "Validation failed"});
        return
    }
    const newElement = await client.element.create({
        data:{
            imageUrl: parsedData.data?.imageUrl ?? '',
            height: parsedData.data?.height ?? 20,
            width: parsedData.data?.width ?? 30,
            static: parsedData.data?.static ?? true
        }
    })
    res.status(200).json({
        id: newElement.id
    })
    

});

adminRouter.put("/element/:elementId", async(req, res) => {
    const elementId = req.params.elementId;
    const parsedData = UpdateElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message: "Validation failed"})
        return
    }
    await client.element.update({
        where:{
            id: elementId
        },
        data:{
            imageUrl: parsedData.data?.imageUrl
        }
    })
    res.status(200).json({message: "Element updated"})
});

adminRouter.post("/avatar", async (req, res) => {
    const parsedData = CreateAvatarSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message: "Validation failed"})
        return
    }
    const newAvatar = await client.avatar.create({
        
        data:{
            imageUrl: parsedData.data?.imageUrl,
            name: parsedData.data?.name
        }
    })
    console.log(newAvatar.id)
    res.status(200).json({
        id: newAvatar.id
        
    })
    

});


adminRouter.post("/map", async(req, res) => {
    const parsedData = CreateMapSchema.safeParse(req.body);
    console.log("parsedData")
    if(!parsedData.success){
        console.log(parsedData.data)

        res.status(400).json({message: "Validation failed"})
        return

    }
    try {
        const map = await client.map.create({
            data:{
                thumbnail:parsedData.data.thumbnail,
                height: parseInt(parsedData.data.dimensions.split("x")[0]),
                width: parseInt(parsedData.data.dimensions.split("x")[1]),
                name: parsedData.data.name,
                mapElement: {
                    create: parsedData.data.defaultElements.map(e => ({
                        elementId: e.elementId,
                        x: e.x,
                        y: e.y
                    }))
                }
    
            }
    
        })
        
        console.log(map.id + "This is map ID")
        res.status(200).json({
            id: map.id
        })
    } catch (error) {
        res.status(400).json({message: "Something happened"})
        
    }
});