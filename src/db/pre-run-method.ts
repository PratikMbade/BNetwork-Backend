
import { prisma } from '../app'
import logger from '../util/logger'

export async function seedBNCoinConfig() {
    // Seed BNMaxRewardsCoins
    await prisma.bNCoinConfig.upsert({
        where: { key: 'BNMaxRewardsCoins' },
        update: {},
        create: {
            key: 'BNMaxRewardsCoins',
            value: 5000,
            BNMaxRewardsCoins: 50000,
            BNMaxAirDropCoins: 1000,
            BNCoinDistributed: 0,
            BNAirDropCoinDistributed: 0
        }
    })
}

export async function createOwnerInUsersTable(){
    try {

        const wallet_address = '0xA30224CA6A6004369114F6A027e8A829EDcDa501';
        const findIsOwnercreate = await prisma.user.findFirst({
            where:{
                wallet_address
            }
        })

        if(findIsOwnercreate){
            return findIsOwnercreate
        }

       const owner =  await prisma.user.create({
            data:{
                regId: 0,
                bn_id: 'BN' + wallet_address.slice(-8),
                wallet_address,
                sponser_address:'',
                directTeam_Count: 0,
                totalTeam_Count: 0,
                registrationTranxhash: null,
                lastestPlanetName: null,
                totalBNCoin: 0,
                isRegistered: true
            }
        })
    
        return owner
        
    } catch (error) {
        logger.error('soemthing went wrong will create owner',error)
        return null;
    }
}

export async function createFirstOwner() {
    const wallet_address = '0x5ab27639ccA145Cac57Ab348c8AA8d23Ca7C95aF'
    const sponser_address = '0x94cB7cFebAC65Ed577073c33a54fdd01336680F0'

    try {
        const newUser = await prisma.user.create({
            data: {
                regId: 10,
                wallet_address,
                bn_id: 'BN' + wallet_address.slice(-8),
                sponser_address,
                directTeam_Count: 0,
                totalTeam_Count: 0,
                registrationTranxhash: null,
                lastestPlanetName: null,
                totalBNCoin: 0,
                isRegistered: true
            }
        })

        // const data: UniversePlanetBuyTypes = {
        //     planetId: 1,
        //     planetName: 'Earth',
        //     planetPrice: 10,
        //     sponser_address: sponser_address,
        //     wallet_address: wallet_address
        // }

        // buyUniversePlanetHandler(data)

        logger.log('First owner created:', newUser)
    } catch (error) {
        logger.error('Error creating first owner:', error)
    }
}

export async function createOwnerInCosMosAutopool() {
    try {

        const reg_user_address = '0xA30224CA6A6004369114F6A027e8A829EDcDa501'

        const OwnerCreate = await prisma.cosMosAutoPool.findFirst({
            where:{
                reg_user_address:reg_user_address
            }
        })


        if(OwnerCreate){
            return  OwnerCreate;
        }
        const dummyUser = await prisma.cosMosAutoPool.create({
            data: {
                bn_id: 'BNEDcDa501', // Replace with your desired bn_id
                reg_user_address: '0xA30224CA6A6004369114F6A027e8A829EDcDa501',
                universeSlot: 0,
                planetName: 'Earth', // You can adjust this or leave it null
                currentLevel: 0, // Example value, adjust as needed
                currentPosition: 0, // Example value, adjust as needed
                autoPoolEarning: 0, // Example value, adjust as needed
                isRoot: false,
                canHaveMoreChildren: true
            }
        })

        logger.log('owner created successfully in autopool:', dummyUser)

        return dummyUser
    } catch (error) {
        logger.error('Error creating owner :', error)

        return null
    }
}

export async function createUniverse() {
    try {
        const dummyUser = await prisma.universeUpgradeEarningTree.create({
            data: {
                wallet_address: '0xF346C0856DF3e220E57293a0CF125C1322cfD778',
                currentPlanet: 1, // You can adjust this or leave it null
                level: 0, // Example value, adjust as needed
                position: 1, // Example value, adjust as needed
                upline_address: ''
            }
        })

        logger.log('Dummy user created in universe:', dummyUser)
    } catch (error) {
        logger.error('Error creating dummy user:', error)
    }
}

export async function createUniverseMatrixOwner() {
    try {
        const dummyUser = await prisma.universeMatrixEarningTree.create({
            data: {
                wallet_address: '0xF346C0856DF3e220E57293a0CF125C1322cfD778',
                planetName: 'Pluto',
                currentChainId: 1,
                currentChainPosition: 1,
                currentChainLevel: 0,
                uplineAddress: '',
                countChainId: 1
            }
        })

        logger.log('UniverseMatrix', dummyUser)
    } catch (error) {
        logger.error('something went wrong in the createUniverseMatrixOwner',error)
    }
}

