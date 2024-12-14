
import config from './config/config'
import app from './app'
import logger from './util/logger'
import { createOwnerInCosMosAutopool, createOwnerInUsersTable, createUniverse, createUniverseMatrixOwner, seedBNCoinConfig } from './db/pre-run-method'
import { listenOnContractRegistration } from './contract/cosmos-contract/cosmos-contract-events'
import { universe_contract_event_listener } from './contract/universe-contract/universe-contract-event'


// import { listenOnContractBuyPlanet, listenOnContractRegistration } from './contract/cosmos-contract/cosmos-contract-events'
declare global {
    interface BigInt {
        toJSON(): number;
    }
}
const server = app.listen(config.PORT)

void (async () => {
    try {
        logger.info(`APPLICATION_STARTED`, {
            meta: {
                PORT: config.PORT,
                SERVER_URL: config.SERVER_URL
            }
        })

        await universe_contract_event_listener()

       
        BigInt.prototype.toJSON = function () { return Number(this) }
        

         await seedBNCoinConfig()
         await listenOnContractRegistration()

        //  await listenOnContractBuyPlanet()

         await createUniverse()

         await createUniverseMatrixOwner()


        const owner = await createOwnerInUsersTable()

        
        logger.info(`Owner created`, {
            meta: {
                user:owner?.wallet_address
            }
        })

        const cosmosOwner = await createOwnerInCosMosAutopool()

        logger.info(`Cosmos owner created`, {
            meta: {
                user:cosmosOwner?.reg_user_address
            }
        })
    } catch (err: unknown) {
        logger.error(`APPLICATION_ERROR`, { meta: err })

        server.close((error) => {
            if (error) {
                logger.error(`APPLICATION_ERROR`, { meta: error })
            }

            process.exit(1)
        })
    }
})()

