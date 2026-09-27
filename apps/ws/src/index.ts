import {WebSocketServer, WebSocket} from  'ws'
import {verify, type JwtPayload} from 'jsonwebtoken'
import{prisma} from  '@repo/db/client'
import type { Game, User, ExtendedWs } from './type.js';
import { generateQuestions } from './utils.js';
const JWT_SECRET = process.env.JWT_SECRET!;
const games: Map<string,Game> = new  Map()
const wss = new WebSocketServer({port: 8000});
const currentQuestion:Map<string,number> = new Map()

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
            const gameId  = crypto.randomUUID()
     games.set(gameId,{
                        id: gameId,

            members: [{
                id: user.id,
                name:  user.username,
                ws,
            }],
            adminId:user.id,
            status:"searching_for_opponent",
            questions:[],
            answer:[]
        })


         wss.clients.forEach((wsAll) => {
                if(ws == wsAll) return;

                wsAll.send(
                    JSON.stringify({
                        type: "GAME_REQUEST",
                        payload:{gameId}
                    })
                )
        })

        return;

        }

        const currentGameFetched = games.get(runningGame.id)!;

        currentGameFetched?.members.push({
            id: user.id,
            name:user.username,
            ws,
        })
        
        currentGameFetched.questions = generateQuestions();
        currentGameFetched.status = 'running'
   
        games.set(currentGameFetched.id,currentGameFetched)
        const firstQuestion =  currentGameFetched.questions[0]!;
        const key = `g:${currentGameFetched.id}-u:${user.id}-q:${firstQuestion.id}`
        
         currentQuestion.set(key,0)
        
        currentGameFetched.members.forEach((mem)=>{
            mem.ws.send(JSON.stringify({
            type:'GAME_ACCEPTED',
            payload:{gameId: runningGame.id,
                firstQuestion
            }
        }))
        })

       
       
    }

})
})