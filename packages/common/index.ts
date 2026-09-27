import {z} from  'zod'

export const registerSchema =  z.object({
    email: z.email(),
    password: z.string().min(4,"password is  too short").max(20,"password is too long"),
})



export const loginSchema =  z.object({
    email: z.email(),
    password: z.string().min(4,"password is  too short").max(20,"password is too long"),
})


export const  zodErrorHandler =  ({error}: {error:z.ZodError}) => {
    return error.issues.map(err => `path:${err.input}, message:${err.message}`).join(", ")
}