import express,{ NextFunction } from 'express';
import errorObject from './error-object';

// @typescript-eslint/no-redundant-type-constituents
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export default (nextFunc:NextFunction,err:Error | unknown, req:express.Request, errorStatusCode:number=500):void =>{

    const errorObj = errorObject(err,req,errorStatusCode);
    return nextFunc(errorObj)
}