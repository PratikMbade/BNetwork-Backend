import { CosmosPlanet } from '@prisma/client'
import { prisma } from '../../app'
import logger from '../../util/logger'

export interface AncestorsArrayTypes {
    id: string
    ancestorsNumber: number
    wallet_address: string
    userId: string
}

function getLevelEarningAmount(planetPrice: number, levelNumber: number): number {
    const totalPriceToDist = planetPrice * 0.4
    const percentAccToLevel = [0.1, 0.05, 0.04, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03]
    const levelIncome = totalPriceToDist * percentAccToLevel[levelNumber - 1]

    return levelIncome
}

async function iterateOnEachAncestors(senderAddress: string, ancestorsArray: AncestorsArrayTypes[], planetName: string, planetPrice: number) {
    try {
        const totalLevelEarningTeam: number = ancestorsArray.length
        let i: number = 1

        for (const ancestor of ancestorsArray) {
            if (i > totalLevelEarningTeam) {
                return
            }

            const isAncestor = await prisma.user.findUnique({
                where: {
                    wallet_address: ancestor.wallet_address
                },
                include: {
                    cosmosPlanets: true
                }
            })

            if (!isAncestor) {
                continue
            }

            const isAncestorHasPlanet = isAncestor.cosmosPlanets.some((planet: CosmosPlanet) => planet.planetName === planetName)
            const currentLevelEarning = isAncestor.levelEarning ?? 0
            const currentLapsAmount = isAncestor.myLaps ?? 0
            const amountGot = getLevelEarningAmount(planetPrice, i)
            const incrementLevelEarning = currentLevelEarning + amountGot
            const incrementLapsEarning = currentLapsAmount + amountGot

            if (isAncestorHasPlanet) {
                await prisma.user.update({
                    where: {
                        wallet_address: isAncestor.wallet_address
                    },
                    data: {
                        levelEarning: incrementLevelEarning
                    }
                })

                await prisma.earningInfo.create({
                    data: {
                        amount: amountGot,
                        receiverAddress: isAncestor.wallet_address,
                        senderAddress: senderAddress,
                        planetName: planetName,
                        earningType: 'LEVEL_EARNING',
                        userId: isAncestor.id
                    }
                })
            } else {
                await prisma.user.update({
                    where: {
                        wallet_address: isAncestor.wallet_address
                    },
                    data: {
                        myLaps: incrementLapsEarning
                    }
                })
            }

            i++
        }
    } catch (error) {
        logger.error('something went wrong in iterateOnEachAncestors', error)
    }
}

async function checkValidAncestor(senderAddress: string, currentAncestor: string, planetNum: number, planetPrice: number, planetName: string) {
    try {
        const currentAnce = await prisma.user.findUnique({
            where: {
                wallet_address: currentAncestor
            },
            include: {
                cosmosPlanets: true,
                ancestors: true
            }
        })

        if (!currentAnce) {
            return
        }

        const totalPrice = planetPrice * 0.3

        const isAncestorHasPlanet = currentAnce?.cosmosPlanets.some((planet) => planet.planetNum === planetNum)

        if (isAncestorHasPlanet) {
            const currentUpgradeEarn = currentAnce?.upgradeEarning ?? 0
            const incrementUpgradeEarningIs = currentUpgradeEarn + totalPrice

            await prisma.user.update({
                where: {
                    wallet_address: currentAnce?.wallet_address
                },
                data: {
                    upgradeEarning: incrementUpgradeEarningIs
                }
            })

            await prisma.earningInfo.create({
                data: {
                    amount: totalPrice,
                    receiverAddress: currentAnce?.wallet_address,
                    senderAddress: senderAddress,
                    planetName: planetName,
                    earningType: 'UPGRADE_EARNING',
                    userId: currentAnce?.id
                }
            })
        } else {
            if (currentAnce?.ancestors.length === 0) {
                return
            }
           await checkValidAncestor(senderAddress, currentAnce.sponser_address!, planetNum, planetPrice, planetName)
        }
    } catch (error) {
        logger.error('something went wrong in checkValidAncestor', error)
    }
}

export const distributeDirectEarning = async (currentUser: string, planetName: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                wallet_address: currentUser
            }
        })

        logger.log('user in direct earning ', user)

        if (!user) {
            return
        }

        if (!user.sponser_address) {
            return
        }

        const sponser = await prisma.user.findFirst({
            where: { wallet_address: user.sponser_address },
            include: {
                cosmosPlanets: true,
                earningList: true
            }
        })

        if (!sponser) {
            return
        }

        if (sponser) {
            const isSponsorHasEarthPlanet = sponser.cosmosPlanets.some((planet) => planet.planetName === planetName)

            if (isSponsorHasEarthPlanet) {
                const directEarning = sponser.directEarning ?? 0
                const incrementDirectEarning = directEarning + 1.5
                await prisma.user.update({
                    where: { wallet_address: sponser.wallet_address },
                    data: { directEarning: incrementDirectEarning }
                })

                await prisma.earningInfo.create({
                    data: {
                        amount: 1.5,
                        receiverAddress: sponser.wallet_address,
                        senderAddress: currentUser,
                        planetName: 'Earth',
                        earningType: 'DIRECT_EARNING',
                        userId: sponser.id
                    }
                })
            } else {
                const lapEarning = sponser.myLaps ?? 0
                const incrementLapsEarning = lapEarning + 1.5
                await prisma.user.update({
                    where: { wallet_address: sponser.wallet_address },
                    data: { myLaps: incrementLapsEarning }
                })
            }
        }
    } catch (error) {
        logger.error('something went wrong in distributeDirectEarning', error)
    }
}

export const distributeLevelEarning = async (currentUser: string, planetName: string, planetPrice: number) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                wallet_address: currentUser
            },
            include: {
                cosmosPlanets: true,
                ancestors: true
            }
        })

        logger.info('distributeLevelEarning', user?.wallet_address)

        if (!user) {
            return
        }

        logger.info('no return yet 1')

        if (user?.ancestors.length === 0) {
            throw new Error('user ancestors legnth 0')

        }



        const sortedAncestorsArray = user.ancestors.sort((a, b) => b.ancestorsNumber - a.ancestorsNumber)


        await iterateOnEachAncestors(user?.wallet_address, sortedAncestorsArray, planetName, planetPrice)
    } catch (error) {
        logger.error('something went wrong in the distributeLevelEarning', error)
    }
}

export const distributeUpgradeEaning = async (currentUser: string, planetNum: number, planetPrice: number, planetName: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                wallet_address: currentUser
            },
            include: {
                cosmosPlanets: true,
                ancestors: true
            }
        })

        if (!user) {
            throw new Error('user not found distributeUpgradeEaning')
        }

        if (user?.ancestors.length === 0) {
            return
        }

        const sortedAncestorsArray = user.ancestors.sort((a, b) => b.ancestorsNumber - a.ancestorsNumber)

        if (sortedAncestorsArray?.length === 0) {
            return
        }


        const ancestorsArrayLength = sortedAncestorsArray?.length

        if (ancestorsArrayLength >= planetNum) {
            const validAncestor = sortedAncestorsArray[planetNum - 1]

            const currentAnce = await prisma.user.findUnique({
                where: {
                    wallet_address: validAncestor.wallet_address
                },
                include: {
                    cosmosPlanets: true,
                    ancestors: true
                }
            })

            if (!currentAnce) {
                return
            }

            const totalPrice = planetPrice * 0.3

            const isAncestorHasPlanet = currentAnce?.cosmosPlanets.some((planet) => planet.planetNum === planetNum)

            if (isAncestorHasPlanet) {
                const currentUpgradeEarn = currentAnce?.upgradeEarning ?? 0
                const incrementUpgradeEarningIs = currentUpgradeEarn + totalPrice

                await prisma.user.update({
                    where: {
                        wallet_address: currentAnce?.wallet_address
                    },
                    data: {
                        upgradeEarning: incrementUpgradeEarningIs
                    }
                })

                await prisma.earningInfo.create({
                    data: {
                        amount: totalPrice,
                        receiverAddress: currentAnce.wallet_address,
                        senderAddress: user.wallet_address,
                        planetName: planetName,
                        earningType: 'UPGRADE_EARNING',
                        userId: currentAnce.id
                    }
                })
            } else {
                const currentLapsEarn = currentAnce?.myLaps ?? 0
                const incrementLapsEarning = currentLapsEarn + totalPrice

                await prisma.user.update({
                    where: {
                        wallet_address: currentAnce?.wallet_address
                    },
                    data: {
                        myLaps: incrementLapsEarning
                    }
                })


                if (currentAnce?.ancestors.length === 0 || !currentAnce?.sponser_address) {
                    return
                }

                await checkValidAncestor(user.wallet_address, currentAnce?.sponser_address, planetNum, planetPrice, planetName)
            }
        } else {
            return
        }
    } catch (error) {
        logger.error('something went wrong in distributeUpgradeEaning', error)
    }
}

