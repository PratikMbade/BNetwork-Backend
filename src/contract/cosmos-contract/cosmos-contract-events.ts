/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3'
import config from '../../config/config'
import logger from '../../util/logger'
import { buyPlanetInCosmos, registerNewUser } from '../../controller/managers/user-service'

// Log configuration information
logger.info('event url is ', {
    meta: {
        url: config.BLOCKCHAIN_WEBSOCKET_URL
    }
})
logger.info('cosmos contract is ', {
    meta: {
        url: config.COSMOS_CONTRACT_ADDRESS
    }
})

const web3Provider = new Web3.providers.WebsocketProvider(config.BLOCKCHAIN_WEBSOCKET_URL!)

web3Provider.on('connect', () => {
    logger.info('WebSocket connection established')
})

web3Provider.on('error', (error: any) => {
    logger.error('WebSocket connection error:', error)
})

const web3 = new Web3(web3Provider)

const contractAddress = config.COSMOS_CONTRACT_ADDRESS

export const fetchEventDataFromTransaction = async (transactionHash: string) => {
    try {
        const receipt = await web3.eth.getTransactionReceipt(transactionHash)

        if (!receipt || !receipt.logs) {
            logger.error(`Receipt or logs not found for transaction ${transactionHash}.`)
            return
        }

        let regId
        let publicAddress = ''
        let sponserAddress = ''

        // Iterate over logs to find the correct event
        receipt.logs.forEach((log) => {
            try {
                if (!log) {
                    logger.error('Log is undefined.')
                    return
                }

                if (!log.topics || !Array.isArray(log.topics) || !log.data) {
                    logger.error('Log topics or data are undefined or incorrectly formatted.', log)
                    return
                }

                // Decode the log
                const decodedLog = web3.eth.abi.decodeLog(
                    [
                        { type: 'address', name: 'user' },
                        { type: 'address', name: 'referral' },
                        { type: 'uint256', name: 'id' }
                    ],
                    log.data,
                    log.topics.slice(1)
                )

                const { user, referral, id } = decodedLog

                const _id = String(decodedLog.id);


                logger.info('NEW TRANSACTION DATA', {
                  meta:{
                    regId:  Number(_id),
                    user: user,
                    referrer: referral
                  }
                })

                regId = id as number
                publicAddress = user as string
                sponserAddress = referral as string
            } catch (error) {
                logger.error('Error decoding log:', error)
            }
        })

        // Register new user if data is valid
        if (publicAddress && sponserAddress && regId !== undefined) {
            await registerNewUser(publicAddress, sponserAddress, Number(regId))
        }
    } catch (error) {
        logger.error('Error fetching event data from transaction:', error)
    }
}

const eventABI = {
    anonymous: false,
    inputs: [
        {
            indexed: false,
            internalType: 'address',
            name: 'user',
            type: 'address'
        },
        {
            indexed: false,
            internalType: 'uint256',
            name: 'plannetId',
            type: 'uint256'
        }
    ],
    name: 'plannetBuy',
    type: 'event'
}
const fetchEventDataFromTransactionBuyPlanet = async (transactionHash: string) => {
    try {
        // Fetch the transaction receipt
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);

        if (!receipt || !receipt.logs) {
            logger.error(`Receipt or logs not found for transaction ${transactionHash}.`);
            return;
        }

        // Loop through the logs to find and decode the event
        const eventSignature = web3.eth.abi.encodeEventSignature(eventABI);
        logger.info('Event signature:', eventSignature);

        for (const log of receipt.logs) {
            try {
                // Filter only logs that match the event signature hash
                if (log.topics && log.topics[0] === eventSignature) {
                    // Decode the event data
                    const decodedLog = web3.eth.abi.decodeLog(
                        eventABI.inputs,
                        log.data!,
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                        log.topics!.slice(1)
                    );

                    if (decodedLog) {
                        const user = String(decodedLog.user); // Convert BigInt to String if necessary
                        const plannetId = Number(decodedLog.plannetId); // Convert BigInt to Number

                        logger.info(`plannetBuy Event Detected:`, {
                            meta: {
                                user: user,
                                plannetId: plannetId,
                            },
                        });

                        await buyPlanetInCosmos(user, plannetId);
                        return { user, plannetId };
                    }
                }
            } catch (error: any) {
                logger.error('Error decoding log:', error);
            }
        }
        return null;
    } catch (error) {
        logger.error('Error fetching event data from transaction:', error);
        return null;
    }
};

export const listenOnContractRegistration = async () => {
    try {
        logger.log('LISTENING ON REGISTRATION', 'Starting to listen on contract events...')

        // Compute the event signature for 'regUserEv(address,address,uint256)'
        const eventSignature = web3.utils.sha3('regUserEv(address,address,uint256)')
        if (!eventSignature) {
            logger.error('Failed to generate event signature.')
            return
        }

        // Subscribe to logs only for the specified contract address and event signature
        const subscription = web3.eth.subscribe('logs', {
            address: contractAddress,
            topics: [eventSignature] // Filtering for the specific event
        });

        (await subscription).on('data', async (log: any) => {
            const { transactionHash } = log

            logger.log('NEW TRANSACTION DETECTED', `New registration detected in transaction: ${transactionHash}`)

            // Fetch event data using the transaction hash
            await fetchEventDataFromTransaction(transactionHash)
        })

        ;(await subscription).on('error', (error: any) => {
            logger.error('Error in event subscription:', error)
        })
    } catch (error) {
        logger.error('Error in listenOnContract:', error)
    }
}

export const listenOnContractBuyPlanet = async () =>{
    try {

        logger.log('LISTENING ON Buy Planet Cosmos', 'Starting to listen on contract events...')
  
      const eventSignature = web3.utils.sha3('plannetBuy(address,uint256)');
    
      if(!eventSignature) return;
    
     
      const subscription = await web3.eth.subscribe('logs', {
        address: contractAddress,
        topics: [eventSignature] // Use 'undefined' instead of 'null'
      });
      
      subscription.on('data',async(log:any)=>{
        const {transactionHash} = log;
        logger.info(`New registration detected in transaction: ${transactionHash}`);
        await fetchEventDataFromTransactionBuyPlanet(transactionHash)
    
      });
    
      subscription.on('error',(error:any)=>{
        logger.error('error in event subscription',error)
      })
    } catch (error) {
      logger.error('Error in listenOnContractBuyPlanet:', error);
  
    }
  }