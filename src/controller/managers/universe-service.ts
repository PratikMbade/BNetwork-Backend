import { User } from '@prisma/client'
import { prisma } from '../../app'
// import { distributeDirectEarningInUniverse } from '../../helper/earning-distribute-universe/earning.distribute'
// import { upgradeEarningTreeUniverse } from '../../helper/earning-distribute-universe/upgrade-distribute'
import { BuyPlanetUniverseRequestBody, getUniversePlanetDetailsById } from '../../custom-types/type'
import logger from '../../util/logger'
import {  distribute3by2Earning, getUserIdsFromContract, getUserWalletDetailsFromContract } from '../../helper/earning-distribute-universe/martrix3by2'

export const distrubuteUniverseEarning = async (
    user: User,
    direct_upline_address: string,
    upgrade_upline_address: string,
    planetName: string,
    planetNum: number,
    planetPrice: number,
    upline_address_event: string,
    userChain: number,
    chainId: number
) => {
    //direct earning
    // await distributeDirectEarningInUniverse(user, direct_upline_address, planetName, planetPrice)
    // await upgradeEarningTreeUniverse(user, planetName, planetNum, planetPrice, upgrade_upline_address)
    logger.info('distrubuteUniverseEarning', { 
        meta:{
            user,
            direct_upline_address,
            upgrade_upline_address,
            planetName,
            planetNum,
            planetPrice,
            upline_address_event,
            userChain,
            chainId
        }
    }
    );

    const user_id_details = await getUserIdsFromContract(user.wallet_address, userChain, planetNum - 1)

    const user_deatils = await getUserWalletDetailsFromContract(user_id_details,direct_upline_address,userChain, planetNum)

    const upline_details = await getUserWalletDetailsFromContract(user_deatils.wallet_details.upline_id,direct_upline_address,userChain, planetNum)


    const createUniverseMatrixUser = await prisma.universeMatrixEarningTree.create({
        data: {
            wallet_address: user.wallet_address,
            uplineAddress: upline_details.wallet_details.user,
            currentChainId: userChain,
            planetName: planetName
        }
    })

    await distribute3by2Earning(createUniverseMatrixUser, planetNum, direct_upline_address, upline_address_event, userChain)
}

export const buyPlanetUniverse = async (requestBody: BuyPlanetUniverseRequestBody) => {
    const { planetId, wallet_address, upgrade_sponser, upline_address,userChain, chainId } = requestBody

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

    await distrubuteUniverseEarning(user,user.sponser_address!, upgrade_sponser, planetName, planetId, planetPrice, upline_address,userChain, chainId)

    return data
}

