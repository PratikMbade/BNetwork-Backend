import { UniverseUpgradeEarningTree, User } from '@prisma/client'
import { prisma } from '../../app'
import logger from '../../util/logger'

type ChildPosition = {
    position: number
    level: number
}

type FindSpaceResult = ChildPosition | null

const distributeEarning = async (
    user: UniverseUpgradeEarningTree,
    upline: UniverseUpgradeEarningTree,
    planetName: string,
    planetPrice: number,
    planetNum: number
) => {
    try {
        let level = 1
        const amountToDistribute = planetPrice * 0.2

        if (planetName === 'Earth') {
            const upgradeEarnig = await prisma.upgradeUniverseEarningHistory.create({
                data: {
                    wallet_address: user.wallet_address,
                    amount: amountToDistribute,
                    currentPlanet: user.currentPlanet,
                    level: user.level,
                    position: user.position,
                    universeUpgradeEarningTreeId: upline?.id,
                    createdAt: new Date()
                }
            })
            logger.info('upgrade earning done', {
                meta: {
                    upgradeEarnig: upgradeEarnig
                }
            })

            return
        }

        while (level <= planetNum) {
            const currentUpline = await prisma.universeUpgradeEarningTree.findFirst({
                where: {
                    wallet_address: upline.wallet_address
                },
                include: {
                    universeUpgradeTreeChildren: true
                }
            })

            if (!currentUpline) {
                const owner = await prisma.universeUpgradeEarningTree.findFirst({
                    where: {
                        wallet_address: '0xF346C0856DF3e220E57293a0CF125C1322cfD778'
                    }
                })

                await prisma.upgradeUniverseEarningHistory.create({
                    data: {
                        wallet_address: user.wallet_address,
                        amount: amountToDistribute,
                        currentPlanet: user.currentPlanet,
                        level: user.level,
                        position: user.position,
                        universeUpgradeEarningTreeId: owner!.id,
                        createdAt: new Date()
                    }
                })

                return
            }

            if (level === planetNum) {
                logger.info('yes matched', {
                    meta: {
                        level: level,
                        planetNum: planetNum
                    }
                })
                const upgrade = await prisma.upgradeUniverseEarningHistory.create({
                    data: {
                        wallet_address: user.wallet_address,
                        amount: amountToDistribute,
                        currentPlanet: user.currentPlanet,
                        level: user.level,
                        position: user.position,
                        universeUpgradeEarningTreeId: currentUpline?.id,
                        createdAt: new Date()
                    }
                })

                logger.info('upgrade earning done', upgrade)

                return
            }

            level = level + 1

            const newUpline = await prisma.universeUpgradeEarningTree.findFirst({
                where: {
                    wallet_address: currentUpline.upline_address
                }
            })

            if (!currentUpline.upline_address) {
                return
            }

            if (!newUpline) {
                return
            }

            upline = newUpline!
        }
    } catch (error) {
        logger.info('something went wrong in the distribute upgrade earning', error)
    }
}

const storeMatrixChildren = async (user_address: string, upline_address: string, planetName: string) => {
    try {
        let level = 10

        await prisma.universeUpgradeEarningTree.findFirst({
            where: {
                wallet_address: user_address
            }
        })

        let currentUpline_address = upline_address

        while (level > 0) {
            const currentUpline = await prisma.universeUpgradeEarningTree.findFirst({
                where: {
                    wallet_address: currentUpline_address
                },
                include: {
                    universeUpgradeTreeChildren: true
                }
            })

            let childrenLength = currentUpline?.universeUpgradeTreeChildren.length

            if (childrenLength === 0) {
                childrenLength = 1
            }

            if (!currentUpline) {
                throw new Error('current upline is not found')
            }

            const addChildInParent = await prisma.universeUpgradeTreeChildren.create({
                data: {
                    wallet_address: user_address,
                    upline_address: currentUpline ? currentUpline.wallet_address : '',
                    childNumber: childrenLength! + 1,
                    currentPlanet: planetName,
                    universeUpgradeEarningTreeId: currentUpline?.id
                }
            })

            logger.info('children added', {
                meta: {
                    children_added: addChildInParent.wallet_address
                }
            })

            level = level - 1

            if (!currentUpline?.upline_address) {
                break
            }

            currentUpline_address = currentUpline.upline_address
        }
    } catch (error) {
        logger.error('something went wrong in the storeMatrixChildren', {
            meta: {
                error: error
            }
        })
    }
}

const findSpaceUnderParent = async (upline_address: string, parentLevel: number, parentPosition: number): Promise<FindSpaceResult> => {
    try {
        const { firstChild, secondChild, thirdChild } = findPositionandLevelFromParent(parentLevel, parentPosition)

        const firstChildExists = await prisma.universeUpgradeEarningTree.findFirst({
            where: {
                position: firstChild.position,
                level: firstChild.level,
                upline_address
            }
        })

        const secondChildExists = await prisma.universeUpgradeEarningTree.findFirst({
            where: {
                position: secondChild.position,
                level: secondChild.level,
                upline_address
            }
        })

        const thirdChildExists = await prisma.universeUpgradeEarningTree.findFirst({
            where: {
                position: thirdChild.position,
                level: thirdChild.level,
                upline_address
            }
        })

        if (!firstChildExists) {
            return { position: firstChild.position, level: firstChild.level }
        } else if (!secondChildExists) {
            return { position: secondChild.position, level: secondChild.level }
        } else if (!thirdChildExists) {
            return { position: thirdChild.position, level: thirdChild.level }
        }

        return null // No available position found
    } catch (error) {
        logger.error('Something went wrong findspace', {
            meta: {
                error: error
            }
        })
        return { position: 0, level: 0 }
    }
}

const findPositionandLevelFromParent = (parentLevel: number, parentPosition: number) => {
    const childLevel = parentLevel + 1

    const firstChildPosition = parentPosition * 3 - 1
    const secondChildPosition = parentPosition * 3
    const thirdChildPosition = parentPosition * 3 + 1

    return {
        firstChild: { position: firstChildPosition, level: childLevel },
        secondChild: { position: secondChildPosition, level: childLevel },
        thirdChild: { position: thirdChildPosition, level: childLevel }
    }
}

export const upgradeEarningTreeUniverse = async (
    currentUser: User,
    planetName: string,
    planetNum: number,
    planetPrice: number,
    upline_address: string
) => {
    try {
        logger.info('3x10 function triggered', {
            meta: {
                user: currentUser.wallet_address,
                upline_address: upline_address,
                planetName: planetName
            }
        })

        const upline = await prisma.universeUpgradeEarningTree.findFirst({
            where: { wallet_address: upline_address }
        })

        logger.info('upline upgradeEarningTreeUniverse', {
            meta: {
                upline: upline
            }
        })

        if (!upline) {
            throw new Error('no upline found upgradeEarningTreeUniverse')
        }

        if (planetName == 'Earth') {
            const avalibaleSpace = await findSpaceUnderParent(upline.wallet_address, upline.level, upline.position)

            if (!avalibaleSpace) {
                throw Error('doesn\'t have available spave')
            }

            const createPositionInTree = await prisma.universeUpgradeEarningTree.create({
                data: {
                    wallet_address:currentUser.wallet_address,
                    upline_address,
                    currentPlanet: planetNum,
                    level: avalibaleSpace.level,
                    position: avalibaleSpace.position
                }
            })
            logger.info('createPositionInTree 3x10 ', {
                meta: {
                    createPositionInTree: createPositionInTree
                }
            })

            await storeMatrixChildren(currentUser.wallet_address, upline_address, planetName)

            await distributeEarning(createPositionInTree, upline, planetName, planetPrice, planetNum)

            return
        }

        const user = await prisma.universeUpgradeEarningTree.findFirst({
            where: {
                wallet_address: currentUser.wallet_address
            }
        })
        if (!user) {
            logger.info('no user')
            throw new Error('user not found for distribute 3x10 earning')
        }

        await distributeEarning(user, upline, planetName, planetPrice, planetNum)

        return
    } catch (error) {
        logger.error('something went wrong in the upgradeEarningTreeUniverse', {
            meta: {
                error: error
            }
        })
    }
}

