import type { Question, questionSign } from "./type.js"

export const  generateQuestions = ():Question[] => {

    const questions:Question[] =[]
    const sign =  [ 'plus','divide','multiply', 'substraction']

    for(let i =0 ; i<=60;i++)
    {
    
    const randomSign = sign[Math.floor(Math.random()*sign.length)]! as questionSign
    const randomOperation1 = Math.floor(Math.random()*10);
    const randomOperation2 = Math.floor(Math.random()*20);

    let answer;

    if(randomSign == "divide")
    {
        answer = randomOperation1 / randomOperation2;
    }
    else if(randomSign =='multiply')
    {
        answer = randomOperation1 * randomOperation2
    }
    else  if(randomSign == 'substraction')
    {
        answer = randomOperation1 - randomOperation2;
    }
    else 
    {
        answer  = randomOperation1 + randomOperation2;
    }
        questions.push({
            id: crypto.randomUUID(),
            sign:randomSign,
            operation1: randomOperation1,
            operation2: randomOperation2,
            answer
        })
    }

    return questions

}