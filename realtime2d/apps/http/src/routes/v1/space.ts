import { json, Router } from "express";
import { AddElementSchema, CreateElementSchema, CreateSpaceSchema, deleteElementSchema } from "../../types";
import client from "@repo/db/client";
import { map } from "zod";

export const spaceRouter = Router();


spaceRouter.post("/", async (req, res) => {
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message: "Validation failed"})
    }
    try {
        if(!parsedData.data?.mapId){
            const space = await client.space.create({
                data:{
                    name: parsedData.data?.name ?? '',
                    width: parseInt((parsedData.data?.dimensions.split("x")[0]) as string),
                    height: parseInt((parsedData.data?.dimensions.split("x")[1]) as string),
                    creatorId: req.userId!
                }
            })
            res.json({spaceId: space.id})

        }
        

        const map = await client.map.findUnique({
            where:{
                id: parsedData.data?.mapId
            }, select:{
                mapElement: true,
                width: true,
                height: true

            }
        })
        if(!map){
            res.status(400).json({message: "No map found"})
            return
        }

        let space = await client.$transaction(async () => {
            const space = await client.space.create({
                data:{
                    name: parsedData.data?.name ?? '',
                    width: map.width,
                    height: map.height,
                    creatorId: req.userId

                }
            });
            

            await client.spaceElements.createMany({
                data: map.mapElement.map(e => ({
                    spaceId: space.id,
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y
                    
                }))
            })
            return space;
        })
        res.json({spaceId: space.id})
        


        

    } catch (error) {
        
    }
})

spaceRouter.delete("/:spaceId", async (req, res) => {
    const spaceId = req.params.spaceId;

    const space = await client.space.findUnique({
        where:{
            id: spaceId
        }, select:{
            creatorId: true
        }
    })

    if(!space){
        res.status(400).json({message: "Space does not exist"})
        return 
    }

    if(space?.creatorId !== req.userId){
        res.status(403).json({message: "unauthorized"})
        return 
    }

    await client.space.delete({
        where:{
            id: spaceId
        }
    })
    res.status(200).json({message: "Space deleted succesfully"})

})

spaceRouter.get("/:spaceId", async(req, res) => {
    const spaceId = req.params.spaceId;
    const space = await client.space.findUnique({
        where:{
            id: spaceId
        },
        include:{
            spaceElement: {
                include:{
                    element: true
                }
            }
        }
    })

    if(!space){
        res.status(400).json({message: "No space found"})
    }
    res.json({
        dimension: `${space?.width}x${space?.height}`,
        elements: space?.spaceElement.map(e => ({
              id: e.id,
              element: {
                id: e.element.id,
                imageUrl: e.element.imageUrl,
                static: e.element.static,
                height: e.element.height,
                width: e.element.width
              },
              x: e.x,
              y: e.y
        }))
    })

})


spaceRouter.post("/element", async (req, res) => {
    const parsedData = AddElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message: "Validation failed"})
        return
    }
    const space = await client.space.findUnique({
        where:{
            id: req.body.spaceId,
            creatorId: req.userId
        }, select:{
            width: true,
            height: true
        }
    })
    if(!space){
        res.status(400).json({message: "Space not found"})
        return
    }

    await client.spaceElements.create({
        data:{
            spaceId: parsedData.data.spaceId,
            elementId: parsedData.data.elementId,
            x: parsedData.data.x,
            y: parsedData.data.y
        }
    })
    res.status(200).json({message: "Element added"})

})


spaceRouter.delete("/element",async (req, res) => {
    const parsedData = deleteElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message: "validation failed"})
        return
    }
    const element = await client.spaceElements.findFirst({
        where:{
            id: parsedData.data.elementId
        }, include:{
            space: true
        }
    })

    if(!element?.space.creatorId || element.space.creatorId !== req.userId){
        res.status(400).json({message: "Unauthorized"})
    }

    await client.spaceElements.delete({
        where:{
            id: parsedData.data.elementId
        }
    })
    res.json({message: "Element deleted"})
})


spaceRouter.get("/elements", (req, res) => {

})


spaceRouter.get("/all", async (req, res) => {
    const spaces = await client.space.findMany({
        where:{
            creatorId: req.userId
        }
    });
    res.json({
        spaces: spaces.map(space => ({
            id: space.id,
            name: space.name,
            thumbnail: space.thumbnail,
            dimesions: (space.width+ "x" +space.height)
        
        }))
    })

})