import { prisma } from '../../app'
import { distributeAutopoolEarning } from '../../helper/earning-distribute-cosmos/autopool'
import { distributeDirectEarning, distributeLevelEarning, distributeUpgradeEaning } from '../../helper/earning-distribute-cosmos/earning'
import { getCosmosPlanetDetailsById } from '../../custom-types/type'
import logger from '../../util/logger'

const handleEarningsDistribution = async (
    wallet_address: string,
    planetName: string,
    planetNum: number,
    planetPrice: number,
    universalPlanetCount: number,
    bn_id: string
) => {
    try {
        if (planetName === 'Earth') {
            await distributeDirectEarning(wallet_address, planetName)
        }

        await distributeLevelEarning(wallet_address, planetName, planetPrice)

        if (planetName !== 'Earth') {
            await distributeUpgradeEaning(wallet_address, planetNum, planetPrice, planetName)
        }

        await distributeAutopoolEarning(wallet_address, planetName, planetPrice, universalPlanetCount, bn_id)
    } catch (error) {
        logger.error('Error in earnings distribution:', error)
        throw error // This will cause the transaction to roll back if something goes wrong
    }
}

export const registerNewUser = async (publicAddress: string, sponserAddress: string, regId: number) => {
    const userExists = await prisma.user.findFirst({ where: { wallet_address: publicAddress } })

    if (userExists) {
        throw new Error('User already registered')
    }

    const sponsor = await prisma.user.findFirst({
        where: { wallet_address: sponserAddress },
        include: { bnCoinEarned: true, direct_team: true }
    })

    if (!sponsor) {
        throw new Error('Sponsor is not registered')
    }

    const last8Characters = publicAddress.slice(-8)
    const newBNId = 'BN' + last8Characters

    const BNMaxRewardsCoins = await prisma.bNCoinConfig.findUnique({
        where: { key: 'BNMaxRewardsCoins' }
    })

    if (!BNMaxRewardsCoins) {
        throw new Error('Configuration not found')
    }

    let bnCoinRegistration = 0
    let bnCoinSponserReward = 0

    if (BNMaxRewardsCoins.BNCoinDistributed! + 0.075 < BNMaxRewardsCoins.BNMaxRewardsCoins) {
        bnCoinRegistration = 0.05
        bnCoinSponserReward = 0.025
    }

    const newUser = await prisma.user.create({
        data: {
            regId,
            wallet_address: publicAddress,
            sponser_address: sponserAddress,
            bn_id: newBNId,
            isRegistered: true,
            bnCoinEarned: {
                create: {
                    bn_id: newBNId,
                    wallet_address: publicAddress,
                    amount: bnCoinRegistration,
                    timeStamp: new Date()
                }
            }
        }
    })

    await prisma.user.upsert({
        where: { wallet_address: sponsor.wallet_address },
        update: { directTeam_Count: { increment: 1 } },
        create: { wallet_address: sponsor.wallet_address, directTeam_Count: 1 }
    })

    await prisma.user.update({
        where: { id: sponsor.id },
        data: {
            direct_team: {
                create: { wallet_address: newUser.wallet_address, id: newUser.id }
            },
            bnCoinEarned: {
                create: {
                    bn_id: newUser.bn_id!,
                    wallet_address: newUser.wallet_address,
                    amount: bnCoinSponserReward,
                    timeStamp: new Date()
                }
            }
        }
    })

    await prisma.bNCoinConfig.update({
        where: { key: 'BNMaxRewardsCoins' },
        data: {
            BNCoinDistributed: { increment: bnCoinRegistration + bnCoinSponserReward },
            BNMaxAirDropCoins: { decrement: bnCoinRegistration + bnCoinSponserReward }
        }
    })

    return newUser
}

export const buyPlanetInCosmos = async (wallet_address: string, planetId: number) => {
    const { planetNum, planetName, planetPrice } = getCosmosPlanetDetailsById(planetId)

    logger.info('planet data ', {
        meta: {
            planetName: planetName,
            planetNum: planetNum
        }
    })

    const user = await prisma.user.findFirst({
        where: {
            wallet_address
        },

        include: { cosmosPlanets: true, bnCoinEarned: true }
    })

    if (!user) {
        throw new Error('User not found')
    }

    const isAlreadyBought = user.cosmosPlanets.some((planet) => planet.planetNum === planetNum)

    if (isAlreadyBought) {
        throw new Error('User already bought this planet')
    }

    await prisma.$transaction(
        async (prisma) => {
            const newPlanet = await prisma.cosmosPlanet.create({
                data: {
                    planetName,
                    planetNum,
                    planetPrice,
                    user: { connect: { id: user.id } },
                    planet: {
                        connectOrCreate: {
                            where: { planetNum }, // Assuming planetNum is unique in the `planet` model
                            create: {
                                planetName,
                                planetNum,
                                planetPrice
                            }
                        }
                    }
                }
            })

            const updatedPlanet = await prisma.planet.update({
                where: { planetNum },
                data: {
                    universalCount: { increment: 1 }
                },
                select: { universalCount: true }
            })

            logger.info('planet data ', {
                meta: {
                    update: updatedPlanet
                }
            })

            return newPlanet
        },
        { timeout: 20000 }
    )

    const updatedPlanet = await prisma.planet.update({
        where: { planetNum },
        data: {
            universalCount: { increment: 1 }
        },
        select: { universalCount: true }
    })

    await handleEarningsDistribution(user.wallet_address, planetName, planetNum, planetPrice, updatedPlanet.universalCount, user.bn_id!)
}

