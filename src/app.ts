import express,{Application,Request,Response, NextFunction} from 'express'
import router from './routes/api-routes';
import globalError from './middleware/global-error';
import responseMessage from './constant/response-message';
import httpError from './util/http-error';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

const app:Application = express()


//Middleware
app.use(helmet())
app.use(express.json())
app.use('/api/v1',router)
app.use((req:Request,_:Response,next:NextFunction) =>{
    try {
        throw Error (responseMessage.NOT_FOUND('route'))
    } catch (error) {
        httpError(next,error,req,404)
    }
})
app.use(globalError)


//prisma client
export const prisma = new PrismaClient()


export default app;