/* eslint-disable no-console */
import config from './config/config';
import app from './app';

const server = app.listen(config.PORT)

;void ( () => { 
    try {
      


        console.info(`APPLICATION_STARTED`, {
            meta: {
                PORT: config.PORT,
                SERVER_URL: config.SERVER_URL
            }
        })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err:unknown) {
        // console.error(`APPLICATION_ERROR`, { meta: err })

        server.close((error) => {
            if (error) {
                
                console.error(`APPLICATION_ERROR`, { meta: error })
            }

            process.exit(1)
        })
    }
})()