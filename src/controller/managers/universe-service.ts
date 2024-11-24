import { User } from '@prisma/client'
import { prisma } from '../../app'
import { distributeDirectEarningInUniverse } from '../../helper/earning-distribute-universe/earning.distribute'
import { upgradeEarningTreeUniverse } from '../../helper/earning-distribute-universe/upgrade-distribute'
import { BuyPlanetUniverseRequestBody, getUniversePlanetDetailsById } from '../../types/type'
import logger from '../../util/logger'


export const distrubuteUniverseEarning = async (
    user: User,
    direct_upline_address: string,
    upgrade_upline_address: string,
    firstThreeby3Sponser: string,
    firstThreeby3SponserChainId: number,
    secondThreeby3Sponser: string,
    secondThreeby3SponserChainId: number,
    thirdThreeby3Sponser: string,
    thirdThreeby3SponserChainId: number,
    planetName: string,
    planetNum: number,
    planetPrice: number
) => {
    //direct earning
    await distributeDirectEarningInUniverse(user, direct_upline_address, planetName, planetPrice)
    await upgradeEarningTreeUniverse(user, planetName, planetNum, planetPrice, upgrade_upline_address)
 
}

export const buyPlanetUniverse = async (requestBody: BuyPlanetUniverseRequestBody) => {
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
    } = requestBody

    const { planetName, planetPrice } = getUniversePlanetDetailsById(planetId)

    //user
    const user = await prisma.user.findFirst({
        where: {
            wallet_address
        },
        include: {
            universeUserPlanets: true
        }
    })

    if (!user) {
        throw new Error('user not found!')
    }

    const isUserHasPlanet = user.universeUserPlanets.find((planet) => planet.planetNum === planetId)

    if (isUserHasPlanet) {
        throw new Error('user already has this planet')
    }

    const data = await prisma.$transaction(async (prisma) => {
        const isCreated = await prisma.universeUsersPlanets.create({
            data: {
                planetNum: planetId,
                planetName,
                planetPrice,
                user: { connect: { id: user.id } },
                universeplanets: {
                    connectOrCreate: {
                        where: {
                            planetName: planetName,
                            planetNum: planetId
                        },
                        create: {
                            planetNum: planetId,
                            planetName,
                            planetPrice
                        }
                    }
                }
            }
        })

        const updateUserCurrent = await prisma.user.update({
            where: {
                wallet_address: wallet_address
            },
            data: {
                currentUniversePlanet: planetId
            }
        })
        logger.info('updateUserCurrent', {
            meta: updateUserCurrent
        })

        logger.info('isCreated', {
            meta: isCreated
        })

        const updateCount = await prisma.universePlanets.update({
            where: { planetNum: planetId, planetName: planetName },
            data: {
                universalCount: { increment: 1 }
            },
            select: { universalCount: true }
        })

        logger.info('updateCount', {
            meta: updateCount
        })
    })

    await distrubuteUniverseEarning(
        user,
        direct_sponser,
        upgrade_sponser,
        firstThreeby3Sponser,
        firstThreeby3SponserChainId,
        secondThreeby3Sponser,
        secondThreeby3SponserChainId,
        thirdThreeby3Sponser,
        thirdThreeby3SponserChainId,
        planetName,
        planetId,
        planetPrice
    )

    return data
}

