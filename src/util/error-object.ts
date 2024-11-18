import express from 'express';
import { HttpError } from '../types/type';
import config from '../config/config';
import { ApplicationEnvironment } from '../constant/application';
import responseMessage from '../constant/response-message';

//@typescript-eslint/no-redundant-type-constituents
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export default (err:Error | unknown, req:express.Request, errorStatusCode:number = 500 ):HttpError =>{

    const errorObj:HttpError = {
        success:false,
        statusCode:errorStatusCode,
        request:{
            ip:req.ip || null,
            method:req.method,
            url:req.originalUrl
        },
        message:err instanceof Error ? err.message || responseMessage.SOMETHING_WENT_WRONG : responseMessage.SOMETHING_WENT_WRONG,
        data:null,
        trace:err instanceof Error ? {error:err.stack}:null
    }


    if(config.ENV === ApplicationEnvironment.PRODUCTION){
        delete errorObj.request.ip
        delete errorObj.trace

    }

    return errorObj

 }