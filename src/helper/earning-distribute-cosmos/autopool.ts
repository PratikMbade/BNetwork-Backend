/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '../../app'
import logger from '../../util/logger'

type PrismaCurrentRoot = {
    id: string
    bn_id: string
    planetName: string | null
    reg_user_address: string
    universeSlot: number | null
    parentId: string | null
    currentLevel: number | null
    currentPosition: number | null
    autoPoolEarning: number | null
    isRoot: boolean
    canHaveMoreChildren: boolean
    children?: { id: string }[] // Simplified for relation connect operations
    recycle?: {
        id: string
        recycleCount: number
        autoPoolId: string
        indexMappings?: {
            id: string
            userLevel: number
            userPosition: number
            recycleMappingId: string
        }[]
    }[]
}

async function distributeEarnings(userId: string, planetName: string,  planetPrice: number) {
    try {
        let currentUser = await prisma.cosMosAutoPool.findFirst({
            where: {
                id: userId,
                planetName: planetName
            },
            include: {
                autoPoolEarningHistory: true
            }
        })

        if (!currentUser) {
            console.log('we don\'t currentUser ')
            return
        }

        const earningsDistribution: { [key: number]: number } = {
            1: 0.05,
            2: 0.1,
            3: 0.1,
            4: 0.25,
            5: 0.5
        }

        const recycleAmountHoldPosition = [53, 54, 55, 56, 57, 58, 59, 60, 61, 62]

        const amount = planetPrice * 0.2
        console.log('amout is ', amount)

        let remainingLevel = 5
        let currentParentId = currentUser.parentId

        let distributedLevels = new Set()
        console.log('distributedlevel ', distributedLevels)

        while (currentParentId && remainingLevel > 0) {
            console.log(`current user ${currentUser.id} currentParentid is ${currentParentId}  and remaining level is ${remainingLevel}`)

            const parentUser = await prisma.cosMosAutoPool.findFirst({
                where: {
                    id: currentParentId,
                    planetName: planetName
                }
            })

            console.log('parent user is ', parentUser)

            if (!parentUser || distributedLevels.has(parentUser.currentLevel)) {
                break
            }

            if (parentUser.id === currentUser.id) {
                console.log('cycle detected in this distribution tree')
                break
            }

            if (parentUser.reg_user_address === '0xF346C0856DF3e220E57293a0CF125C1322cfD778') {
                let totalAmt = 0

                for (let level = 5; level >= 6 - remainingLevel; level--) {
                    totalAmt += amount * earningsDistribution[level]
                }

                const updateAutoPoolEarning = await prisma.cosMosAutoPool.update({
                    where: {
                        id: parentUser.id,
                        planetName: planetName
                    },
                    data: {
                        autoPoolEarning: { increment: totalAmt }
                    }
                })

                console.log('updatedAutopool earning history ', updateAutoPoolEarning)

                break
            }

            let levelDifference = Math.max(currentUser.currentLevel! - parentUser.currentLevel!)
            console.log(
                `currentuser level ${currentUser.currentLevel} and parentuser currentLevel ${parentUser.currentLevel} and level dif ${levelDifference}`
            )
            const distributionPercentage = earningsDistribution[levelDifference] || 0

            console.log('distribute percentage ', distributionPercentage)
            let distributeAmount = amount * distributionPercentage
            console.log('distributeAmount', distributeAmount)

            if (typeof parentUser.autoPoolEarning !== 'number') {
                parentUser.autoPoolEarning = 0
            }

            distributeAmount = typeof distributeAmount === 'number' ? distributeAmount : 0
            console.log('dist amount is ', distributeAmount)

            const addDistributionAmt = await prisma.cosMosAutoPool.update({
                where: {
                    id: parentUser.id,
                    planetName: planetName
                },
                data: {
                    autoPoolEarning: { increment: distributeAmount }
                }
            })

            console.log('addDistributionAmt', addDistributionAmt)

            //now its time push the earning history in the earning array;

            console.log('current parent id where its going to store ', currentParentId)

            /// check autopool member id and with current user

            const isCurrentRecycleParent = await prisma.cosMosAutoPool.findFirst({
                where: {
                    planetName: planetName,
                    isRoot: true
                },
                include: {
                    autopoolMembers: true
                }
            })

            console.log('isCurrentRecycleParent is ', isCurrentRecycleParent?.id)

            console.log('parent id ', parentUser.id)

            const isRecycledAmtHoldId = await prisma.children.findFirst({
                where: {
                    parentId: parentUser.id,
                    planetName: planetName,
                    wallet_address: currentUser.reg_user_address
                }
            })

            console.log('isRecycledAmtHoldId', isRecycledAmtHoldId)

            if (isCurrentRecycleParent?.id == parentUser.id && recycleAmountHoldPosition.includes(isRecycledAmtHoldId?.childrenNumber!)) {
                // find autopool  child

                const newEariningHistoryEntry = await prisma.earningHistory.create({
                    data: {
                        recycleNumber: currentUser.currentRecycle || 0,
                        reg_user_address: currentUser.reg_user_address,
                        bn_id: currentUser.bn_id,
                        planetName: planetName,
                        amount: 0,
                        currentPosition: currentUser.currentPosition!,
                        currentLevel: currentUser.currentLevel!,
                        autoPool: {
                            connect: { id: currentParentId }
                        }
                    }
                })

                console.log('newEariningHistoryEntry with no amount', newEariningHistoryEntry)

                if (newEariningHistoryEntry) {
                    distributedLevels.add(parentUser.currentLevel)
                }
                remainingLevel--
                console.log('before currentnode is  no amount', currentParentId)
                currentParentId = parentUser.parentId
                console.log('after currentNode is  no amount', currentParentId)
            } else {
                const newEariningHistoryEntry = await prisma.earningHistory.create({
                    data: {
                        recycleNumber: currentUser.currentRecycle || 0,
                        reg_user_address: currentUser.reg_user_address,
                        bn_id: currentUser.bn_id,
                        planetName: planetName,
                        amount: distributeAmount,
                        currentPosition: currentUser.currentPosition!,
                        currentLevel: currentUser.currentLevel!,
                        autoPool: {
                            connect: { id: currentParentId}
                        }
                    }
                })

                console.log('newEariningHistoryEntry', newEariningHistoryEntry)

                if (newEariningHistoryEntry) {
                    distributedLevels.add(parentUser.currentLevel)
                }
                remainingLevel--
                console.log('before currentnode is ', currentParentId)
                currentParentId = parentUser.parentId
                console.log('after currentNode is ', currentParentId)
            }
        }
    } catch (error) {
        console.log('something went wrong in the distibuteEarnings ', error)
    }
}

function calculateLevelFromPosition(position: number) {
    if (position < 1) {
        return undefined
    }

    const adjustedPosition = position - 1

    let level = Math.floor(Math.log2(adjustedPosition + 1))

    return level
}

function calculateParentDetails(position: number, level: number) {
    let parentPosition, parentLevel

    parentPosition = Math.floor(position / 2)

    parentLevel = level - 1

    return { parentPosition, parentLevel }
}

async function findSuitableParent(planetName: string, currentUserId: string) {
    try {
        let queue = []

        const rootNode = await prisma.cosMosAutoPool.findFirst({
            where: {
                planetName: planetName,
                isRoot: true
            },
            select: {
                id: true,
                children: { select: { id: true }, take: 62 } // Fetch only necessary data
            }
        })

        if (rootNode?.id === currentUserId) {
            return null
        }

        console.log('root node is  ', rootNode)

        if (!rootNode) {
            throw new Error('Root node not found.')
        }

        queue.push(rootNode)

        while (queue.length > 0) {
            const currentNode: any = queue.shift()
            console.log('current Node ', currentNode.id)

            console.log('queue has ', queue)

            if (currentNode?.children && currentNode.children.length < 62) {
                console.log('currentNode ', currentNode)
                return currentNode
            }

            if (currentNode?.children && currentNode.children.length > 0) {
                const childNodes = await prisma.cosMosAutoPool.findMany({
                    where: {
                        parentId: currentNode.id || 2
                    },
                    select: {
                        id: true,
                        children: { select: { id: true }, take: 62 }
                    }
                })

                console.log('helo')
                console.log('child nodes are ', childNodes)

                queue.push(...childNodes)
            }
        }

        return null
    } catch (error) {
        console.error('Error finding suitable parent:', error)
        return null
    }
}

async function addChildToPlanetTreeTemporarily(
    currentRootId: string,
    currentRootAddress: string,
    userId: string,
    userAddress: string,
    level: number,
    position: number,
    planetName: string
) {
    try {
        const tempNode = await prisma.temporaryChildrenSchema.upsert({
            where: {
                id: currentRootId,
                planetName: planetName // Replace `uniqueId` with the actual id
            },
            update: {},
            create: {
                panrentAddress: currentRootAddress,
                planetName: planetName
            },
            select: {
                id: true,
                TempChild: { select: { childId: true } }
            }
        })

        const istempNodeAlreadyExist = tempNode.TempChild.some((child: any) => child.childId === userId)

        if (istempNodeAlreadyExist) {
            return
        }

     await prisma.temporaryChildrenSchema.update({
            where: { id: tempNode.id },
            data: {
                TempChild: {
                    create: {
                        childId: userId,
                        childAddress: userAddress,
                        level: level,
                        position: position
                    }
                }
            }
        })
    } catch (error) {
        console.error('Error updating temporary children:', error)
    }
}

async function assignChildrenToNodesIteratively(
    planetName: string,
    initialNode: PrismaCurrentRoot,
    newUserLevel: number,
    newUserPosition: number,
    maxLevels = 5
) {
    try {
        let currentNode = initialNode

        let currentLevel = 1

        while (currentLevel <= maxLevels && currentNode) {
            let parent


            if (currentNode.parentId) {
                parent = currentNode.parentId
            } else {
                let data = await findSuitableParent(planetName, currentNode.id)
                parent = data.id

                if (!parent && !currentNode.isRoot) {
                    await prisma.cosMosAutoPool.update({
                        where: { id: currentNode.id },
                        data: { isRoot: true }
                    })
                    break
                } else if (parent) {
                    currentNode.parentId = parent

                    await prisma.cosMosAutoPool.update({
                        where: { id: currentNode.id },
                        data: { parentId: parent.id }
                    })
                }
            }

            let parentsDetails = await prisma.cosMosAutoPool.findFirst({
                where: {
                    id: parent,
                    planetName: planetName
                },
                include: {
                    autopoolMembers: true
                }
            })

            if (parentsDetails) {
                if (parent) {
                    const parentChildrenCount = await prisma.children.count({
                        where: {
                            parentId: parent,
                            planetName: planetName
                        }
                    })

                    if (parentChildrenCount < 62) {
                        const existingChild = await prisma.children.findFirst({
                            where: {
                                wallet_address: initialNode.reg_user_address,
                                parentId: parent,
                                planetName: planetName
                            }
                        })

                        // If no existing child found, create a new one
                        if (!existingChild) {
                            let childNumber = parentsDetails.autopoolMembers.length

                              await prisma.children.create({
                                data: {
                                    planetName: planetName,
                                    wallet_address: initialNode.reg_user_address,
                                    childrenNumber: childNumber + 1,
                                    parentId: parent // Assuming parent.id is the foreign key for the autoPool
                                }
                            })
                            await addChildToPlanetTreeTemporarily(
                                parentsDetails.id,
                                parentsDetails.reg_user_address,
                                initialNode.id,
                                initialNode.reg_user_address,
                                newUserLevel,
                                newUserPosition,
                                planetName
                            )

                            currentNode = parentsDetails // Move to the parent node for the next iteration
                        } else {
                            break
                        }
                    } else {
                        break
                    }
                }
            }

            currentLevel++
        }
    } catch (error) {
        console.error('An error occurred during assignment:', error)
    }
}

function getCurrentRootParentPosition(position: number) {
    let parentPosition = Math.floor(position / 2)

    return parentPosition
}

async function updateChildrenParent(planetName: string, currentUser: string, newParentForCurrentRootChildren: string) {
    try {
        const childs = await prisma.cosMosAutoPool.findMany({
            where: {
                planetName: planetName,
                reg_user_address: currentUser
            }
        })

        if (!childs) {
            return
        }
        console.log(`childrens find from ${planetName}  and childrens are ${childs}`)

        for (const child of childs) {
            console.log('childs is ', child.reg_user_address)
            child.parentId = newParentForCurrentRootChildren
        }
    } catch (error) {
        console.log('something went wrong in updateChildrenParent', error)
    }
}

async function transitionRootUserIfNeeded(userAddress: string, planetName: string, universalPlanetCount: number, planetPrice: number) {
    try {
        const currentRoot = await prisma.cosMosAutoPool.findFirst({
            where: {
                isRoot: true,
                planetName: planetName
            },
            include: {
                recycle: {
                    include: {
                        indexMappings: true
                    }
                },
                autopoolMembers: {
                    include: {
                        autoPool: true
                    }
                },
                children: true
            }
        })

        logger.info('current root in transition ', currentRoot?.reg_user_address)

        if (!currentRoot) {
            return
        }

        if (currentRoot.autopoolMembers.length === 62) {
            await prisma.temporaryChildrenSchema.findMany({
                where: {
                    panrentAddress: currentRoot.reg_user_address,
                    planetName: planetName
                }
            })



            let shouldIncrementRecycleCount
            let maxRecycleCount
            let newRecycleCount

            if (currentRoot.recycle.length >= 1) {
                shouldIncrementRecycleCount = currentRoot.recycle.some((recycleEntry: any) => recycleEntry.indexMappings.length > 0)

                maxRecycleCount = currentRoot.recycle.reduce((max: any, curr: any) => Math.max(max, curr.recycleCount), -1)

                newRecycleCount = shouldIncrementRecycleCount ? maxRecycleCount + 1 : maxRecycleCount
            } else {
                const pool = await prisma.cosMosAutoPool.findFirst({
                    where: {
                        reg_user_address: currentRoot.reg_user_address,
                        planetName: planetName
                    },
                    include: {
                        recycle: true
                    }
                })

                if (!pool) {
                    console.log('no pool is there')
                    return
                }

                // For example, get the recycleCount from the first RecycleMapping record.
                const firstRecycleEntry = pool.recycle[0]
                newRecycleCount = firstRecycleEntry ? firstRecycleEntry.recycleCount : 0
                console.log('newRecycleCount ', newRecycleCount)
            }

            const getRcycleEntry = currentRoot.recycle[0]
            console.log('get recycle entry ', getRcycleEntry)
            console.log('current root recycle ', currentRoot.recycle)

            // Update recycleCount for each related RecycleMapping record
            await Promise.all(
                currentRoot.recycle.map(async (recycleEntry: any) => {
                    await prisma.recycleMapping.update({
                        where: {
                            id: recycleEntry.id
                        },
                        data: {
                            recycleCount: newRecycleCount
                        }
                    })
                })
            )

            const pool = await prisma.cosMosAutoPool.findFirst({
                where: {
                    reg_user_address: currentRoot.reg_user_address,
                    planetName: planetName
                },
                include: {
                    recycle: {
                        include: {
                            indexMappings: {
                                include: {
                                    userIds: true // Ensure userIds are included
                                }
                            }
                        }
                    }
                }
            })

            if (!pool) {
                console.log('No pool found with the specified reg_user_address and planetName.')
                return
            }

            // now transfer the Root user
             await prisma.cosMosAutoPool.update({
                where: {
                    id: currentRoot.id,
                    reg_user_address: currentRoot.reg_user_address,
                    planetName: planetName
                },
                data: {
                    isRoot: false
                }
            })

            await prisma.children.updateMany({
                where: {
                    parentId: currentRoot.id
                },
                data: {
                    parentId: undefined
                }
            })

            const newParentForCurrentRootChildren = currentRoot.parentId

            await updateChildrenParent(planetName, currentRoot.reg_user_address, newParentForCurrentRootChildren!)

            const nextRootposition = currentRoot.currentPosition! + 1

            const nextRootUser = await prisma.cosMosAutoPool.findFirst({
                where: {
                    currentPosition: nextRootposition,
                    planetName: planetName
                }
            })

            if (!nextRootUser) {
                console.log('No next  root user not found')
            }

            const newParentForNextRoot = currentRoot.parentId

            if (nextRootUser) {
                await prisma.cosMosAutoPool.update({
                    where: {
                        id: nextRootUser.id,
                        planetName: planetName,
                        reg_user_address: nextRootUser.reg_user_address
                    },
                    data: {
                        parentId: newParentForNextRoot
                    }
                })
            }

            const lastUserPositionRecord = await prisma.cosMosAutoPool.findFirst({
                where: {
                    planetName: planetName
                },
                orderBy: {
                    currentPosition: 'desc'
                },
                take: 1
            })

            const lastUserPosition = lastUserPositionRecord?.currentPosition || 1

            currentRoot.currentPosition = lastUserPosition + 1

            const newLevelCurrentRoot = calculateLevelFromPosition(lastUserPosition + 1)

            console.log(`id ${currentRoot.id}, userAddress:${userAddress} ,newLevel ${newLevelCurrentRoot}`)

               await prisma.cosMosAutoPool.update({
                where: {
                    id: currentRoot.id,
                    planetName: planetName,
                    reg_user_address: currentRoot.reg_user_address
                },
                data: {
                    currentLevel: newLevelCurrentRoot,
                    currentPosition: lastUserPosition + 1
                }
            })

            currentRoot.currentLevel = Math.floor(Math.log2(currentRoot.currentPosition))

            const currentRootParentPosition = getCurrentRootParentPosition(currentRoot.currentPosition)

            //update current root new positon,universalPlanetCount and parent;

            const currentRootParent = await prisma.cosMosAutoPool.findFirst({
                where: {
                    planetName: planetName,
                    currentPosition: currentRootParentPosition
                }
            })

            if (!currentRootParent) {
                console.log('currentRootParent is not found ')
            }

            ///update the universalPlanetCount and parent  currentRoot

            const updateUniversalCountandParent = await prisma.cosMosAutoPool.update({
                where: {
                    id: currentRoot.id,
                    planetName: planetName,
                    reg_user_address: currentRoot.reg_user_address
                },
                data: {
                    universeSlot: universalPlanetCount,
                    parentId: currentRootParent!.id
                }
            })

             await prisma.planet.update({
                where: {
                    planetName: planetName
                },
                data: {
                    universalCount: {
                        increment: 1
                    }
                }
            })

            if (nextRootUser) {
                await prisma.cosMosAutoPool.update({
                    where: {
                        id: nextRootUser.id,
                        reg_user_address: nextRootUser.reg_user_address,
                        planetName: planetName
                    },
                    data: {
                        isRoot: true
                    }
                })

                console.log(
                    `check before assign ${currentRoot.currentLevel} address ${currentRoot.reg_user_address}  and position ${currentRoot.currentPosition} ${currentRoot.parentId}`
                )

                await assignChildrenToNodesIteratively(
                    planetName,
                    updateUniversalCountandParent,
                    currentRoot.currentLevel,
                    currentRoot.currentPosition
                )

                console.log('Transitioned to new root user:', nextRootUser.reg_user_address)

                //remove all autoPool children from current root

                await prisma.children.deleteMany({
                    where: {
                        parentId: currentRoot.id
                    }
                })

                await distributeEarnings(currentRoot.id, planetName, planetPrice)

                return nextRootUser
            }
        }

        return currentRoot
    } catch (error) {
        //  currentRoot.recycle.find()
        logger.error('something went wrong in transitionRootUserIfNeeded', error)
        return 
    }
}

export const distributeAutopoolEarning = async (
    userAddress: string,
    planetName: string,
    planetPrice: number,
    universalPlanetCount: number,
    bn_id: string
) => {
    try {
        logger.info(`user address: ${userAddress} and universalCount is ${universalPlanetCount}`)
        if (universalPlanetCount === 1) {
            const firstUserparent = await prisma.cosMosAutoPool.findFirst({
                where: { isRoot: false, planetName: planetName }
            })

            if (!firstUserparent) {
                throw new Error('Parent not found')
            }

            const firstUser = await prisma.cosMosAutoPool.create({
                data: {
                    bn_id,
                    reg_user_address: userAddress,
                    isRoot: true,
                    universeSlot: universalPlanetCount,
                    currentLevel: 0,
                    currentPosition: 1,
                    planetName: planetName,
                    parent: {
                        connect: { id: firstUserparent.id }
                    }
                }
            })

            await prisma.cosMosAutoPool.update({
                where: { id: firstUserparent.id },
                data: {
                    children: {
                        connect: {
                            id: firstUser.id
                        }
                    }
                }
            })

            return
        }

        await transitionRootUserIfNeeded(userAddress, planetName, universalPlanetCount, planetPrice)

        const lastUserPosition = await prisma.cosMosAutoPool.findFirst({
            where: {
                planetName
            },

            orderBy: {
                currentPosition: 'desc'
            },
            select: {
                currentPosition: true
            }
        })

        const lastPositionValue = lastUserPosition?.currentPosition ?? 1

        const newPosition = lastPositionValue + 1

        const newLevel = calculateLevelFromPosition(newPosition)

        let newParent

        const { parentPosition, parentLevel } = calculateParentDetails(newPosition, newLevel!)

        const potentialParent = await prisma.cosMosAutoPool.findFirst({
            where: {
                planetName: planetName,
                currentPosition: parentPosition,
                currentLevel: parentLevel
            }
        })

        if (potentialParent) {
            newParent = potentialParent
            logger.info('found potential parent ', newParent)
        } else {
            logger.error('No potential parent found for position', parentPosition, 'and level', parentLevel)
        }

        const planetCount = await prisma.planet.findFirst({
            where: {
                planetName: planetName
            }
        })

        const currentUniversalCount = planetCount?.universalCount

        if (!newParent) {
            throw new Error('something went wrong in create newParent')
        }

        const existingPool = await prisma.cosMosAutoPool.findFirst({
            where: {
                bn_id: bn_id,
                planetName: planetName
            }
        })

        // Upsert to create or update the record

        if (!existingPool) {
            const newUser = await prisma.cosMosAutoPool.upsert({
                where: {
                    // Define the unique combination of fields to check
                    bn_id_planetName: {
                        // Use the composite key name if necessary
                        bn_id: bn_id,
                        planetName: planetName
                    }
                },
                update: {
                    // Fields to update if the record exists
                    reg_user_address: userAddress,
                    universeSlot: currentUniversalCount,
                    currentLevel: newLevel,
                    currentPosition: newPosition,
                    parentId: newParent.id
                },
                create: {
                    // Fields to create if the record doesn't exist
                    bn_id: bn_id,
                    reg_user_address: userAddress,
                    planetName: planetName,
                    universeSlot: currentUniversalCount,
                    currentLevel: newLevel,
                    currentPosition: newPosition,
                    isRoot: false,
                    parentId: newParent.id
                }
            })

            if (!newUser) {
                throw new Error('something went wrong in creating new user')
            }

            await assignChildrenToNodesIteratively(planetName, newUser, newUser.currentLevel!, newUser.currentPosition!)

            await distributeEarnings(newUser.id, planetName, planetPrice)

            return
        }

        await assignChildrenToNodesIteratively(planetName, existingPool, existingPool.currentLevel!, existingPool.currentPosition!)

        await distributeEarnings(existingPool.id, planetName, planetPrice)

        return 'success'
    } catch (error) {
        logger.error('something went wrong in distributeAutopoolEarning', error)

        return
    }
}

