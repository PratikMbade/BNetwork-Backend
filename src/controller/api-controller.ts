/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express'
import httpResponse from '../util/http-response'
import responseMessage from '../constant/response-message'
import httpError from '../util/http-error'
import quicker from '../util/quicker'
import { RegisterUserRequestBody } from '../types/type'
import { registerNewUser } from './managers/user-service'

export default {
    health: (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const healthData = {
                application: quicker.getApplicationHealth(),
                system: quicker.getSystemHealth(),
                timestamp: Date.now()
            }
            httpResponse(req, res, 200, responseMessage.SUCCESS, healthData)
        } catch (error) {
            httpError(next, error, req, 500)
        }
    },
    registerUser: async (
        req: express.Request<Record<string, any>, object, RegisterUserRequestBody>,
        res: express.Response,
        next: express.NextFunction
    ): Promise<void>  => {
        try {
            const { publicAddress, sponsorAddress } = req.body

            // Early return if validation fails
            if (!publicAddress || !sponsorAddress) {
               httpResponse(req,res,200,'User already exist','')
            }

            // Delegate logic to the service layer
            const newUser = await registerNewUser(publicAddress, sponsorAddress)
            httpResponse(req,res,201,'User registered successfully',newUser)

        } catch (error) {
            // Use structured error handling
            httpError(next, error, req, 500)
        }
    }
}

