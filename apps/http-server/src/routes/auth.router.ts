import Router from  "express";
import {prisma} from "@repo/db/client"
import {registerSchema, loginSchema, zodErrorHandler} from "@repo/common/zod"
import {hash,compare} from "bcryptjs"
import {sign} from "jsonwebtoken"
import {JWT_SECRET} from "../utils.js"
import { authMiddleware } from "../auth.middleware.js";

export  const authRouter =  Router();

authRouter.post('/login',async (req,res) =>  {
    const {success, data, error} = loginSchema.safeParse(req.body);

    if(!success){
        res.status(403).send({message:zodErrorHandler({error})});
        return;
    }

    const {email,  password} = data;

    const existingUser  =  await  prisma.user.findUnique({where:{email}});

    if(!existingUser){
        res.status(403).send({message:'user does not exists'});
        return;
    }

    const isPasswordValid = await compare(password, existingUser.password);

    if(!isPasswordValid){
        res.status(403).send({message:'invalid  password'});
        return;
    }

    const token = sign({userId:existingUser.id},JWT_SECRET,{expiresIn:'1h'});

    return  res.status(201).send({message:'login route',data:{token}});
})

authRouter.post('/register',async (req,res) => {
    const {success,  data,error }= registerSchema.safeParse(req.body);

    if(!success){
        res.status(403).send({message:zodErrorHandler({error})});
        return;
    }

    const {email, password} = data;

    const  existingUser =await prisma.user.findUnique({where:{email}});

    if(existingUser){
        res.status(403).send({message:'user already  exists'});
        return;
    }

    const username  = email.split('@')[0]!

    const hashedPassword = await  hash(password,10);

    await prisma.user.create({data:{email,password:hashedPassword,  username}});

    return res.status(201).send({message:'user created successfully'});

})

authRouter.post('/me',authMiddleware,async (req, res)=> {
try{
    const {userId} = req.body;

    const user = await prisma.user.findFirst({where:{id:userId},omit:{password:true},include:{rating:true,
        gameMember:{include:{game:true}}
    }});

    return res.status(201).send({data:user});
}
    catch(error){
        return  res.status(500).send({message: "something went wrong!!"})
    }

})