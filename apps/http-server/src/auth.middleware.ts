import type { Request, Response, NextFunction } from "express";
import {verify, type JwtPayload} from 'jsonwebtoken'
import {JWT_SECRET} from "./utils.js"

export const authMiddleware = async (req: Request,  res:Response, next: NextFunction) => {

    const bearerToken = req.headers.authorization;

    if(!bearerToken || !bearerToken?.startsWith('Bearer ')){
        return res.status(403).send({message:'invalid token'});
    }

    const extractedToken  = bearerToken.split(' ')[1];

    if(!extractedToken){
        return res.status(403).send({message:'invalid token'});
    }

    try {
        const decodedToken   = verify(extractedToken,JWT_SECRET!) as {userId:string};
       req.userId  =  decodedToken.userId
        next();
    }
    catch (error) {
        return res.status(403).send({message:'invalid token'});
    }

}