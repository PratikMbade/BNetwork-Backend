import { User } from '@prisma/client'
import { prisma } from '../../app'
import logger from '../../util/logger'

export const distributeDirectEarningInUniverse = async (currentUser: User, uplineeAddress: string, planetName: string, planetPrice: number) => {
    try {
        logger.info('check upline', {
            meta: uplineeAddress
        })

        const user = currentUser
        if (!user) {
            return
        }

        if (!user.sponser_address) {
            logger.info('user do not have in distributeDirectEarningInUniverse')
            return
        }

        const upline = await prisma.user.findFirst({
            where: { wallet_address: uplineeAddress },
            include: {
                universeUserPlanets: true,
                universeEarningList: true
            }
        })
        logger.info('upline we got is ',{
            meta:upline
        })

        if (!upline) {
            logger.info('upline is not distributeDirectEarningInUniverse')
            return
        }

        if (upline) {
            const isSponsorHasEarthPlanet = upline.universeUserPlanets.some((planet) => planet.planetName === planetName)

            logger.info('isSponserHashEarthPlanet', {meta:isSponsorHasEarthPlanet})
            if (isSponsorHasEarthPlanet) {
                const directEarning = upline.universeDirectEarning ?? 0
                const amountForDirect = planetPrice * 0.2
                const incrementDirectEarning = directEarning + amountForDirect
                 await prisma.user.update({
                    where: { wallet_address: upline.wallet_address },
                    data: { universeDirectEarning: incrementDirectEarning }
                })

                const earningCreate = await prisma.universeEarningInfo.create({
                    data: {
                        amount: amountForDirect,
                        receiverAddress: upline.wallet_address,
                        senderAddress: user.wallet_address,
                        planetName: planetName,
                        earningType: 'DIRECT_EARNING',
                        userId: upline.id
                    }
                })
                logger.info('earning created ', {
                    meta:earningCreate
                })
            } else {
                const lapEarning = upline.myLaps ?? 0
                const amount = planetPrice * 0.2
                const incrementLapsEarning = lapEarning + amount
                const lap = await prisma.user.update({
                    where: { wallet_address: upline.wallet_address },
                    data: { myLaps: incrementLapsEarning }
                })

                logger.info('laps created ', {
                    meta:lap
                })
            }
        }
    } catch (error) {
        logger.info('something went wrong in distributeDirectEarning', {
            meta:error
        })
    }
}




 