import config from './config/config'
import app from './app'
import logger from './util/logger'

const server = app.listen(config.PORT)

void (() => {
    try {
        logger.info(`APPLICATION_STARTED`, {
            meta: {
                PORT: config.PORT,
                SERVER_URL: config.SERVER_URL
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
