import express,{Application,Request,Response, NextFunction} from 'express'
import router from './routes/api-routes';
import globalError from './middleware/global-error';
import responseMessage from './constant/response-message';
import httpError from './util/http-error';

const app:Application = express()

//Middleware
app.use(express.json())

//Base route
app.use('/api/v1',router)


//404 Handler
app.use((req:Request,_:Response,next:NextFunction) =>{
    try {
        throw Error (responseMessage.NOT_FOUND('route'))
    } catch (error) {
        httpError(next,error,req,404)
    }
})

//Global Error Handler
app.use(globalError)


export default app;