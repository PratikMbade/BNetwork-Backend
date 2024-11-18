import express from 'express';
import { HttpResponse } from '../types/type';
import config from '../config/config';
import { ApplicationEnvironment } from '../constant/application';
import logger from './logger';


export default (req:express.Request,res:express.Response,responseStatusCode:number,responseMsg:string,data:unknown ):void =>{

    const response:HttpResponse = {
        success:true,
        statusCode:responseStatusCode,
        request:{
            ip:req.ip || null,
            method:req.method,
            url:req.originalUrl
        },
        message:responseMsg,
        data:data
    }

    logger.info(`CONTROLLER_RESPONSE`,{ 
        meta:response
    })


    if(config.ENV === ApplicationEnvironment.PRODUCTION){
        delete response.request.ip
    }

    res.status(responseStatusCode).json(response)
}