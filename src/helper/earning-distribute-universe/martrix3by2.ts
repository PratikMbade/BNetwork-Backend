
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UniverseMatrixEarningTree } from '@prisma/client'
import logger from '../../util/logger'
import config from '../../config/config'
import { getUniverseContractInstance } from '../../contract/universe-contract/universe-contract-instane'
import { ethers } from 'ethers'
import { getUniversePlanetDetailsById } from '../../custom-types/type'
import { prisma } from '../../app'


type WalletDetails = {
    user: string
    upline_id: number
    left: number
    middle: number
    right: number
    left_address: string
    middle_address: string
    right_address: string
}

export async function getUserIdsFromContract(user_address: string, chainId: number, planetId: number): Promise<number> {
    try {
        logger.info('Getting user ids from contract', {meta:{
            user_address: user_address,
            chainId: chainId,
            planetId: planetId
        }}
    )
        const universe_contract_instance: ethers.Contract =  getUniverseContractInstance()

        const rawIds = await universe_contract_instance.functions.userIds(user_address, chainId, planetId)

        return ethers.BigNumber.from(rawIds.id).toNumber()
    } catch (error) {
        logger.error('something went wrong in getUserIdsFromContract', {
            meta: {
                error: error
            }
        })

        return 0
    }
}

async function getUserChainCount(direct_id:number,planetId:number){
    try {
        const universe_contract_instance: ethers.Contract =  getUniverseContractInstance()

        logger.info('Getting chain count args', {
            meta:{
                direct_id: direct_id,
                planetId: planetId
            }
        })
        const chainCount = await universe_contract_instance.functions.chainByid(direct_id,planetId)
        logger.info('Getting chain count', {
            meta:{
               chainCount: ethers.BigNumber.from(chainCount[0]).toNumber()
            }
        }
        )

        return ethers.BigNumber.from(chainCount[0]).toNumber()
    } catch (error) {
        logger.error('something went wrong in getUserChainCount', {
            meta: {
                error: error
            }
        })

        return 0
    }
}

export async function getUserWalletDetailsFromContract(user_id: number,direct_address:string, chainId: number, planetId: number): Promise<{ wallet_details: WalletDetails }> {
    try {
        logger.info('Getting wallet details from contract', {meta:{
            user_id: user_id,
            chainId: chainId,
            planetId: planetId
        }}
    )
        const universe_contract_instance: ethers.Contract =  getUniverseContractInstance()

        let rawInfo = await universe_contract_instance.functions.Walletdetails(planetId, user_id, chainId)

        logger.info('Getting rawInfo', {meta:{
            rawInfo_User: rawInfo.user
        }})

        //check is we getting 0x000 
        if(rawInfo.user == '0x0000000000000000000000000000000000000000'){
            logger.info('User not found in the contract', {meta:{
                user_id: user_id,
                direct_address: direct_address
            }})

            const direct_sponser_id = await getUserIdsFromContract(direct_address,1,planetId)
            logger.info('Getting direct sponser id', {meta:{
                direct_sponser_id: direct_sponser_id
            }})
           
           const direct_recycle_count = await getUserChainCount(direct_sponser_id,planetId)

           logger.info('Getting direct_recycle_count', {meta:{
            direct_recycle_count: direct_recycle_count
            }})


            if(direct_recycle_count === 1){
                rawInfo = await universe_contract_instance.functions.Walletdetails(planetId,user_id, 1)

           }
           else if(direct_recycle_count === 2){
            rawInfo = await universe_contract_instance.functions.Walletdetails(planetId,user_id, 2)

           }
           else if(direct_recycle_count === 3){
                rawInfo = await universe_contract_instance.functions.Walletdetails(planetId,user_id, 3)
           }
           else if  (direct_recycle_count === 4){
                rawInfo = await universe_contract_instance.functions.Walletdetails(planetId,user_id, 4)
           }    
           else if  (direct_recycle_count === 5){   
                rawInfo = await universe_contract_instance.functions.Walletdetails(planetId,user_id, 5)
           }
           else if (direct_recycle_count === 6){   
                rawInfo = await universe_contract_instance.functions.Walletdetails(planetId,user_id, 6)
           }    
           else if (direct_recycle_count === 7){
                rawInfo = await universe_contract_instance.functions.Walletdetails(planetId,user_id, 7)
           }
           else if (direct_recycle_count === 8){
                rawInfo = await universe_contract_instance.functions.Walletdetails(planetId,user_id, 8)
           }
           else if (direct_recycle_count === 9){
                rawInfo = await universe_contract_instance.functions.Walletdetails(planetId,user_id, 9)
           }
           else if (direct_recycle_count === 10){
            rawInfo = await universe_contract_instance.functions.Walletdetails(planetId,user_id, 10)
       }
           const wallet_details: WalletDetails = {
            user: rawInfo.user,
            upline_id: ethers.BigNumber.from(rawInfo.upline).toNumber(),
            left: ethers.BigNumber.from(rawInfo.left).toNumber(),
            middle: ethers.BigNumber.from(rawInfo.middle).toNumber(),
            right: ethers.BigNumber.from(rawInfo.right).toNumber(),
            left_address: rawInfo.leftadd,
            middle_address: rawInfo.middleadd,
            right_address: rawInfo.rightadd
        }


           logger.info('Getting rawInfo when direct recycle', {meta:{
            rawInfo: wallet_details
           }});
        }

        const wallet_details: WalletDetails = {
            user: rawInfo.user,
            upline_id: ethers.BigNumber.from(rawInfo.upline).toNumber(),
            left: ethers.BigNumber.from(rawInfo.left).toNumber(),
            middle: ethers.BigNumber.from(rawInfo.middle).toNumber(),
            right: ethers.BigNumber.from(rawInfo.right).toNumber(),
            left_address: rawInfo.leftadd,
            middle_address: rawInfo.middleadd,
            right_address: rawInfo.rightadd
        }

        return {
            wallet_details:wallet_details
        }
    } catch (error) {
        logger.error('something went wrong in getUserIdAndWalletDetails', {
            meta: {
                error: error
            }
        })

        return {
            wallet_details: {
                user: '',
                upline_id: 0,
                left: 0,
                middle: 0,
                right: 0,
                left_address: '',
                middle_address: '',
                right_address: ''
            }
        }
    }
}

async function setUniverseMatrixEarningHistory(
    current_user: UniverseMatrixEarningTree,
    chainId: number,
    planetId: number,
    position: number,
    level: number,
    amount: number,
    upline_user: UniverseMatrixEarningTree
) {
    try {
        const createUserInTree = await prisma.universeMatrixEarningHistory.create({
            data: {
                wallet_address: current_user.wallet_address,
                latestPlanet: planetId,
                amount: amount,
                position: position,
                level: level,
                chainId: chainId,
                createdAt: new Date(),
                universeMatrixEarningTreeId: upline_user.id
            }
        })

        logger.info('User added to the matrix', {
            meta: {
                user: createUserInTree
            }
        })
    } catch (error) {
        logger.error('something went wrong in setCurrentUserInMatrix', {
            meta: {
                error: error
            }
        })
    }
}

async function setMatrixChildren(current_user: string, upline_user: UniverseMatrixEarningTree, chainId: number, planetName: string) {
    try {
        logger.info('Setting matrix children',{ meta:{
            current_user: current_user,
            upline_user: upline_user.wallet_address,
            chainId: chainId,
            planetName: planetName
        }
    }
    )
        // Retrieve the current maximum childNumber for the given upline_user
        const maxChild = await prisma.matrixChildren.findFirst({
            where: {
                upline_address: upline_user.wallet_address,
                chainId: chainId
            },
            orderBy: {
                childNumber: 'desc'
            },
            select: {
                childNumber: true
            }
        })

        // Determine the new childNumber
        const newChildNumber = maxChild ? maxChild.childNumber + 1 : 1

        // Create the new matrixChildren entry
        const createMatrixChildren = await prisma.matrixChildren.create({
            data: {
                wallet_address: current_user,
                upline_address: upline_user.wallet_address,
                chainId: chainId,
                childNumber: newChildNumber,
                planetName: planetName,
                universeMatrixEarningTreeId: upline_user.id
            }
        })

        logger.info('Matrix children created', {
            meta: {
                matrixChildren: createMatrixChildren
            }
        })
    } catch (error) {
        logger.error('something went wrong in setMatrixChildren', {
            meta: {
                error: error
            }
        })
    }
}

export async function distribute3by2Earning(
    current_user: UniverseMatrixEarningTree,
    planetId: number,
    directSponser: string,
    upline_address: string,
    chainId: number
) {
    try {
        logger.info('Distributing 3by2 earning', {
            meta: {
                currentUser: current_user.wallet_address,
                planetId: planetId,
                direct_sponser: directSponser,
                upline: upline_address
            }
        })

        const planetDetails = getUniversePlanetDetailsById(planetId)
        const { planetName, planetPrice } = planetDetails

        const upline = await prisma.universeMatrixEarningTree.findFirst({
            where: {
                wallet_address: config.CONTRACT_OWNER_ADDRESS,
                planetName: planetName
            }
        })

        if (!upline) {
            logger.error('Upline not found', {
                meta: {
                    upline_address: upline_address
                }
            })
            return
        }

        const user_id = await getUserIdsFromContract(current_user.wallet_address, 1, planetId - 1)

        const user_walletdetails = await getUserWalletDetailsFromContract(user_id,directSponser,chainId, planetId)

        const upline_walletdetails = await getUserWalletDetailsFromContract(user_walletdetails.wallet_details.upline_id,directSponser,chainId, planetId)

        if (upline_walletdetails.wallet_details.user === config.CONTRACT_OWNER_ADDRESS) {
            const amount = planetPrice / 2

            if (upline_walletdetails.wallet_details.left_address === current_user.wallet_address) {
                await setUniverseMatrixEarningHistory(current_user, chainId, planetId, 1, 1, amount, upline)
            } else if (upline_address === upline_walletdetails.wallet_details.middle_address) {
                await setUniverseMatrixEarningHistory(current_user, chainId, planetId, 2, 1, amount, upline)
            } else {
                await setUniverseMatrixEarningHistory(current_user, chainId, planetId, 3, 1, amount, upline)
            }

            await setMatrixChildren(current_user.wallet_address, upline, chainId, planetName)
        } else {
            // find position of the user in the matrix

            const level_2_upline_id = upline_walletdetails.wallet_details.upline_id

            const upline2_walletdetails = await getUserWalletDetailsFromContract(level_2_upline_id,directSponser,chainId, planetId)

            const level_1_upline = upline_walletdetails.wallet_details.user
            const level_2_upline = upline2_walletdetails.wallet_details.user

            logger.info('Level data', {
                meta: {
                    level_1_upline: level_1_upline,
                    level_2_upline: level_2_upline
                }
            })

            if (level_2_upline === config.CONTRACT_OWNER_ADDRESS) {
                const upline_instance_level_1 = await prisma.universeMatrixEarningTree.findFirst({
                    where: {
                        wallet_address: level_1_upline,
                        planetName: planetName
                    }
                })

                if(!upline_instance_level_1) {
                    logger.error('Upline instance not found in level 1', {
                        meta: {
                            upline: level_1_upline
                        }
                    })
                    return
                }

                // check wheather amount is hold or not)
                if (upline_address !== config.UNIVERSE_CONTRACT_ADDRESS) {
                    // distribute the amount
                    await setUniverseMatrixEarningHistory(current_user, chainId, planetId, 1, 1, planetPrice / 2, upline)

                }

                await setMatrixChildren(current_user.wallet_address, upline_instance_level_1, chainId, planetName)
            }
            else if(level_1_upline !== config.CONTRACT_OWNER_ADDRESS) {
                const upline_instance_level_2 = await prisma.universeMatrixEarningTree.findFirst({
                    where: {
                        wallet_address: level_2_upline,
                        planetName: planetName
                    }
                })

                if(!upline_instance_level_2) {
                    logger.error('Upline instance not found in level 2', {
                        meta: {
                            upline: level_2_upline
                        }
                    })
                    return
                }

                // check wheather amount is hold or not)
                if (upline_address !== config.UNIVERSE_CONTRACT_ADDRESS) {
                    // distribute the amount
                    await setUniverseMatrixEarningHistory(current_user, chainId, planetId, 1, 1, planetPrice / 2, upline_instance_level_2)
                }

                await setMatrixChildren(current_user.wallet_address, upline_instance_level_2, chainId, planetName)

                // send for level 1 
                const upline_instance_level_1 = await prisma.universeMatrixEarningTree.findFirst({
                    where: {
                        wallet_address: level_1_upline,
                        planetName: planetName
                    }
                })

                await setMatrixChildren(current_user.wallet_address, upline_instance_level_1!, chainId, planetName)



            }

        }

        // 2. level 1 upline
        // 3. leve 2 upline
        // normal

        //if above 1 level then find the position and distribute the earning to the upline
        // const walletDetailsFunction = await

        //if above 2 level then find the position under the upline's child and distribute the earning to the upline
        //if current user is at position 7 to 12 amount goes to autoupgrade and if the user is at position 13 then the amount goes to recycle
    } catch (error) {
        logger.error('something went wrongin the distribute3by2Earning', {
            meta: {
                error: error
            }
        })
    }
}

