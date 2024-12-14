/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../custom-types/type'

export default (err: HttpError, _: Request, res: Response, __: NextFunction) => {
    res.status(err.statusCode).json(err)
}
