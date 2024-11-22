import config from './config/config'
import app from './app'
import logger from './util/logger'
import { createOwnerInCosMosAutopool, createOwnerInUsersTable, seedBNCoinConfig } from './db/pre-run-method'
import { listenOnContractBuyPlanet, listenOnContractRegistration } from './contract/cosmos-contract/cosmos-contract-events'

const server = app.listen(config.PORT)

void (async () => {
    try {
        logger.info(`APPLICATION_STARTED`, {
            meta: {
                PORT: config.PORT,
                SERVER_URL: config.SERVER_URL
            }
        })

         await seedBNCoinConfig()

         await listenOnContractRegistration()

         await listenOnContractBuyPlanet()


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

