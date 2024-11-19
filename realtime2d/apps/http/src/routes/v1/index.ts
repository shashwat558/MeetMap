import { Router } from "express";

export const router = Router();

const userRouter = require("./user")
const spaceRouter = require("./space")
const adminRouter = require("./admin")


router.post("/signup", (req, res) => {
    res.json({
        message: "Signup"
    })

})

router.post("/signin", (req, res) => {
    res.json({
        message: "Signin"
    })

})


router.get('/elements', (req, res) => {
     
})

router.get('/avatars', (req, res) => {
     
})


router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);