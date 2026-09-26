import {WebSocketServer, WebSocket} from  'ws'
import {verify, type JwtPayload} from 'jsonwebtoken'
import{prisma} from  '@repo/db/client'

const JWT_SECRET = process.env.JWT_SECRET!;

const wss = new WebSocketServer({port: 8000});

export type  User = {
    id:string,
    name:string,
    ws:WebSocket
}

const onlineUsers: Map<string, User> = new  Map();

wss.on("connection",async (ws, req)=> {
const  token = req.url?.split("?token=")[1];

if(!token){
    wss.close();
    return;
}

let decoded;


try  {
 decoded  =  verify(token!, JWT_SECRET) as JwtPayload

}catch(err)  {
    wss.close();
    return;
}

const user = await prisma.user.findUnique({
    where:{id: decoded.userId}
})

if(!user)
{
    wss.close();
    return;
}

onlineUsers.set(decoded.userId,{
    name: user.username,
    ws,
    id: user.id
})

wss.clients.forEach(ws => ws.send(JSON.stringify({
    type:'ONLINE_USERS',
    payload: {
        users: Array.from(onlineUsers)
    }
})))

wss.on("message",(event) =>{
    const parsedData  = JSON.parse(event.toString())

})
})