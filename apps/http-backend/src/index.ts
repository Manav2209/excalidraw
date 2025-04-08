import express from 'express';
import {RegisterSchema , LoginSchema , CreateRoomSchema} from "@repo/common/types"
import cors from "cors";
import { prismaClient} from "@repo/db/client"
import bcrypt from "bcrypt"
import jwt  from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware';

const app = express();
app.use(express.json());
app.use(cors())


app.post('/signup' , async (req, res) => {
    const validatedFields = RegisterSchema.safeParse(req.body)

    if(!validatedFields.success){
        res.json({
            error:"Invalid fields"
        })

        return
    }

    const {username, email,password } = validatedFields.data;

    const hashedPassword = await bcrypt.hash(password , 10)
    const existingUser = await prismaClient.user.findUnique({
        where:{
            email
        }
    })

    if(existingUser){
        res.json({
            error:"User Already Exists!"
        })
        return;
    }
    const user = await prismaClient.user.create({
        data: {
            name: username,
            email,
            password: hashedPassword
        }
    })


    res.json({
        user
    })
})

app.post('/signin' , async (req, res) => {

    const validatedFields = LoginSchema.safeParse(req.body);

    if(!validatedFields || !validatedFields.success || !validatedFields.data.password){
        res.json({
            error:"Invalid fields"
        })
        return;
    }

    const {email , password} = validatedFields.data;

    const user = await prismaClient.user.findUnique({
        where:{
            email
        }
    })

    if(!user){
        res.json({
            error:"User does not exist"
        })
        return;
    }

    const matchPassword =await bcrypt.compare(password,user.password);

    if(!matchPassword){
        res.json({
            error: "Invalid Credentials!"
        })
        return;
    }
    const token = jwt.sign({userId : user.id} , JWT_SECRET)


    res.json({
        token
    })

})

app.post('/room' , middleware , async(req, res) => {

    const validRoom  = CreateRoomSchema.safeParse(req.body)

    if(!validRoom.success){
        res.json({
            error :"Invalid fields"
        })
        return
    }

    const userId = req.userId

    if(!userId){
        res.json({
            error: "User doesn't exist!"
        })
        return;
    }

    const { roomName } = validRoom.data

    const existingRoom = await prismaClient.room.findFirst({
        where: {
            slug :roomName
        }
    })

    if(existingRoom){
        res.json({
            error: "Room already exists!"
        })
        return;
    }
    
    const room = await prismaClient.room.create({
        data: {
           slug: roomName,
           adminId: userId
        }
    })

    res.json({
        room
    })
})

app.get("/room/:slug" , async (req, res) => {
    const slug = req.params.slug
    const room = await prismaClient.room.findFirst({
        where:{
            slug
        }
       
    })

    res.json({
        room
    })
})


app.listen(3000, ()=>{
    console.log("Listening")
})