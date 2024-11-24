/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express'
import { BuyPlanetUniverseRequestBody } from '../types/type'
import httpError from '../util/http-error'
import logger from '../util/logger'
import httpResponse from '../util/http-response'
import { buyPlanetUniverse } from './managers/universe-service'

export default {
    buyPlanetUniverseController: async (
        req: express.Request<Record<string, any>, object, BuyPlanetUniverseRequestBody>,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const {
                planetId,
                wallet_address,
                direct_sponser,
                upgrade_sponser,
                firstThreeby3Sponser,
                firstThreeby3SponserChainId,
                secondThreeby3Sponser,
                secondThreeby3SponserChainId,
                thirdThreeby3Sponser,
                thirdThreeby3SponserChainId
            } = req.body

            if (
                !planetId ||
                !wallet_address ||
                !direct_sponser ||
                !upgrade_sponser ||
                !firstThreeby3Sponser ||
                !firstThreeby3SponserChainId ||
                !secondThreeby3Sponser ||
                !secondThreeby3SponserChainId ||
                !thirdThreeby3Sponser || 
                !thirdThreeby3SponserChainId
            ) {
                httpResponse(req, res, 400, 'Bad request! something missed in request body', next)
            }

           

        await buyPlanetUniverse(
              req.body
            )
        } catch (error) {
            logger.error('soemthing went wrong in the buyPlanetUniverse ', {
                meta: error
            })
            httpError(next, error, req, 500)
        }
    }
}

