import express from 'express';
import httpResponse from '../util/http-response';
import responseMessage from '../constant/response-message';
import httpError from '../util/http-error';


export default {
    self:(req:express.Request,res:express.Response,next:express.NextFunction) =>{

        try {
            httpResponse(req,res,200,responseMessage.SUCCESS,{id:'11'})
        } catch (error) {
            httpError(next,error,req,500)
        }
    }
}