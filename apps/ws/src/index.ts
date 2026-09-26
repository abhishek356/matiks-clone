import {WebSocketServer, WebSocket} from  'ws'
import {verify, type JwtPayload} from 'jsonwebtoken'
import{prisma} from  '@repo/db/client'

const JWT_SECRET = process.env.JWT_SECRET!;
const games: Map<string,Game> = new  Map()
const wss = new WebSocketServer({port: 8000});
export type Game = {
    id:string,

}
export type  User = {
    id:string,
    name:string,
    ws:WebSocket
}

export type ExtendedWs = WebSocket & {userId:string}

const onlineUsers: Map<string, User> = new  Map();

wss.on("connection",async (ws:ExtendedWs, req)=> {
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
ws.userId  = decoded.userId;

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
    const parsedData  = JSON.parse(event.toString());

    if(parsedData.type == 'PLAY_GAME')
    {
        const {} =  parsedData.payload;


        let runningGame:Game|null = null
        for(const [gameId,game] of games.entries())
        {
            if(game.status == "searching_for_opponent")
            {
                runningGame = game
                break;
            }
        }

        if(!runningGame)
        {
     games.set({
            members: [{
                id: user.id,
                name:  user.username
            }],
            adminId:user.id,
            status:"searching_for_opponent",
            questions:[],
            answers:[]
        })


         wss.clients.forEach((wsAll) => {
                if(ws == wsAll) return;

                wsAll.send(
                    JSON.stringify({
                        type: "GAME_REQUEST",
                        payload: {
                            username:  user.username,
                        }
                    })
                )
        })

        }

   
       
    }

})
})