import type { WebSocket } from "ws"

export type  User = {
    id:string,
    name:string,
    ws:WebSocket
}

export type questionSign = 'plus' | 'substraction'|'multiply'|'divide'

export type  Question ={
    id:string,
    operation1:number,
    operation2:number,
    sign: questionSign,
    answer:number

}

export type  Answer =  {
    id:  string,
    answer: number,
    questionId:  string,

}

export type ExtendedWs = WebSocket & {userId:string}

export type Game = {
    id:string;
    status:'searching_for_opponent'|'over'|'running';
    adminId:string,
    members: User[],
    questions: Question[],
    answer: Answer[]

}
