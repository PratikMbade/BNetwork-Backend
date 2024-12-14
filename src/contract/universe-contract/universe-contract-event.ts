
/* eslint-disable no-console */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3'
import config from '../../config/config'
import logger from '../../util/logger'
import { buyPlanetUniverse } from '../../controller/managers/universe-service'
// import BN from 'bn.js'

const web3Provider = new Web3.providers.WebsocketProvider(config.BLOCKCHAIN_WEBSOCKET_URL!)
const web3 = new Web3(web3Provider)

web3Provider.on('connect', () => {
    logger.info('WebSocket connection established')
})

web3Provider.on('error', (error: any) => {
    logger.error('WebSocket connection error:', error)
})

const contractAddress = config.UNIVERSE_CONTRACT_ADDRESS

const eventABI = {
    anonymous: false,
    inputs: [
        { indexed: true, internalType: 'address', name: 'from', type: 'address' },
        { indexed: true, internalType: 'address', name: 'to', type: 'address' },
        { indexed: true, internalType: 'uint256', name: 'amount', type: 'uint256' },
        { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        { indexed: false, internalType: 'uint256', name: 'tochain', type: 'uint256' }
    ],
    name: 'Threeby3Transfer',
    type: 'event'
}

const eventABIPackageBuy = {
    anonymous: false,
    inputs: [
        { 'indexed': true, 'internalType': 'address', 'name': '_user', 'type': 'address' },
        { 'indexed': true, 'internalType': 'uint256', 'name': '_package', 'type': 'uint256' },
        { 'indexed': true, 'internalType': 'uint256', 'name': '_time', 'type': 'uint256' },
        { 'indexed': false, 'internalType': 'uint256', 'name': 'chainid', 'type': 'uint256' }
    ],
    name: 'PackageBuy',
    type: 'event'
}


const eventSignature = web3.utils.sha3('Threeby3Transfer(address,address,uint256,uint256,uint256)');

const eventSignaturePackageBuy = web3.utils.sha3('PackageBuy(address,uint256,uint256,uint256)');

interface CurrentBlockData {
    user_address: string;
    package_id: string;
    timestamp: number;
    toChain:  number;
    upline_threeby2: string;
    threeBy2_chain: number;
}


let  currentblock_data:CurrentBlockData = {
    user_address: '',
    package_id: '',
    timestamp: 0,
    toChain: 0,
    upline_threeby2: '',
    threeBy2_chain: 0
}

export async function fetchEventDataFromTransactionUniversePackageBuy(transactionHash: string): Promise<void> {
    try {
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);

        if (!receipt || !receipt.logs) {
            console.error(`Receipt or logs not found for transaction ${transactionHash}.`);
            return;
        }

        receipt.logs.forEach((log: any) => {
            try {
                // Validate log structure
                if (!log || !log.topics || !Array.isArray(log.topics) || !log.data) {
                    console.error('Log topics or data are undefined or incorrectly formatted.', log);
                    return;
                }

                // Check if this log matches the Threeby3Transfer event signature
                if (log.topics[0] !== eventSignaturePackageBuy) {
                    // This log is from a different event, skip decoding
                    return
                }

                // Decode the log using the ABI since we confirmed it matches the event signature
                const decodedLog = web3.eth.abi.decodeLog(
                    eventABIPackageBuy.inputs,
                    log.data,
                    log.topics.slice(1) // remove the event signature hash from the topics array
                );

                // Extract event fields
                const user = decodedLog._user;
                const package_id = String(decodedLog._package);
                const timestamp = String(decodedLog._time);
                const tochain = String(decodedLog.chainid);

                // Log the decoded data
                console.log('Decoded Package buy Event Data:', {
                    user,
                    package_id,
                    timestamp,
                    tochain
                });

                currentblock_data={
                    ...currentblock_data,
                    user_address:String(user),
                    package_id:package_id,
                    timestamp:parseInt(timestamp),
                    toChain:parseInt(tochain)
                }

                logger.info('curreetn block data package buy', {
                    meta: currentblock_data
                });
            

            } catch (error) {
                console.error('Error decoding log:', {
                    log: log,
                    error: error
                });
            }
        });

        if(currentblock_data.user_address && currentblock_data.upline_threeby2){
            await buyPlanetUniverse({
                planetId: Number(currentblock_data.package_id),
                wallet_address: currentblock_data.user_address,
                direct_sponser: config.CONTRACT_OWNER_ADDRESS!,
                upgrade_sponser: '0x',
                upline_address: currentblock_data.upline_threeby2,
                userChain: currentblock_data.toChain,
                chainId: currentblock_data.threeBy2_chain
            })
            logger.info('curreetn block data after sending to backend', {
                meta: currentblock_data
            });

            currentblock_data ={
                user_address: '',
                package_id: '',
                timestamp: 0,
                toChain: 0,
                upline_threeby2: '',
                threeBy2_chain: 0
            }
        }
    

    } catch (error) {
        console.error('Error in fetchEventDataFromTransactionUniverse', {
            error: error
        });
    }
}


 export async function fetchEventDataFromTransactionUniverse(transactionHash: string): Promise<void> {
    try {
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);

        if (!receipt || !receipt.logs) {
            console.error(`Receipt or logs not found for transaction ${transactionHash}.`);
            return;
        }

        receipt.logs.forEach((log: any) => {
            try {
                // Validate log structure
                if (!log || !log.topics || !Array.isArray(log.topics) || !log.data) {
                    console.error('Log topics or data are undefined or incorrectly formatted.', log);
                    return;
                }

                // Check if this log matches the Threeby3Transfer event signature
                if (log.topics[0] !== eventSignature) {
                    // This log is from a different event, skip decoding
                    return
                }

                // Decode the log using the ABI since we confirmed it matches the event signature
                const decodedLog = web3.eth.abi.decodeLog(
                    eventABI.inputs,
                    log.data,
                    log.topics.slice(1) // remove the event signature hash from the topics array
                );

                // Extract event fields
                const from = decodedLog.from;
                const to = decodedLog.to;
                const amount = String(decodedLog.amount);
                const timestamp = String(decodedLog.timestamp);
                let tochain = String(decodedLog.tochain);

                // Log the decoded data
                console.log('Decoded Threeby3Transfer Event Data:', {
                    from,
                    to,
                    amount,
                    timestamp,
                    tochain
                });

                if(to === config.UNIVERSE_CONTRACT_ADDRESS){
                    tochain = String(1);
                }

                currentblock_data={
                    ...currentblock_data,
                    timestamp:parseInt(timestamp),
                    upline_threeby2:String(to),
                    threeBy2_chain:parseInt(tochain)
                }

                logger.info('curreetn block data universe', {
                    meta: currentblock_data
                });


             
            
                

            } catch (error) {
                console.error('Error decoding log:', {
                    log: log,
                    error: error
                });
            }
        });

        if(currentblock_data.user_address && currentblock_data.upline_threeby2){
            await buyPlanetUniverse({
                planetId: Number(currentblock_data.package_id),
                wallet_address: currentblock_data.user_address,
                direct_sponser: config.CONTRACT_OWNER_ADDRESS!,
                upgrade_sponser: '0x',
                upline_address: currentblock_data.upline_threeby2,
                userChain: currentblock_data.toChain,
                chainId: currentblock_data.threeBy2_chain
            })
            logger.info('curreetn block data after sending to backend', {
                meta: currentblock_data
            });

            currentblock_data ={
                user_address: '',
                package_id: '',
                timestamp: 0,
                toChain: 0,
                upline_threeby2: '',
                threeBy2_chain: 0
            }
        }
    


    } catch (error) {
        console.error('Error in fetchEventDataFromTransactionUniverse', {
            error: error
        });
    }
}



export const listenOnUniverseContractBuyPlanet = async () => {
    try {
        logger.log('LISTENING ON Threeby3', 'Starting to listen on contract events...')

        const eventSignature = web3.utils.sha3('Threeby3Transfer(address,address,uint256,uint256,uint256)')

        if (!eventSignature) {
            logger.error('Failed to generate event signature.')
            return
        }

        const subscription = web3.eth.subscribe('logs', {
            address: contractAddress,
            topics: [eventSignature] // Filtering for the specific event
        })

        logger.info('subscription', {
            meta: {
                subscription: subscription
            }
        })
        ;(await subscription).on('data', async (log: any) => {
            const { transactionHash } = log

            logger.log('NEW TRANSACTION DETECTED', `New registration detected in transaction: ${transactionHash}`)

            // Fetch event data using the transaction hash
            await fetchEventDataFromTransactionUniverse(transactionHash)
        })
    } catch (error) {
        logger.error('something went wrongin the listenOnUniverseContractBuyPlanet', {
            meta: {
                error: error
            }
        })
    }
}


export const listenOnUniverseContractSellPlanet = async () => {
    try {

        logger.info('LISTENING ON Package Buy', 'Starting to listen on contract events...')

        const eventSignature = web3.utils.sha3('PackageBuy(address,uint256,uint256,uint256)')

        if (!eventSignature) {
            logger.error('Failed to generate event signature.')
            return
        }

        const subscription = web3.eth.subscribe('logs', {
            address: contractAddress,
            topics: [eventSignature] // Filtering for the specific event
        })

        logger.info('subscription', {
            meta: {
                subscription: subscription
            }
        })
        ;(await subscription).on('data', async (log: any) => {
            const { transactionHash } = log

            logger.log('NEW TRANSACTION DETECTED', `New planet buy detected in transaction: ${transactionHash}`)

            // Fetch event data using the transaction hash
            await fetchEventDataFromTransactionUniverse(transactionHash)
        })

    } catch (error) {

        logger.error('something went wrongin the listenOnUniverseContractSellPlanet', {
            meta: {
                error: error
        }
       })
    
    }
}



export const listenOnUniverseContractEvent = async (
    eventName: string,
    contractAddress: string,
    logHandler: (transactionHash: string) => Promise<void>
) => {
    try {
        logger.info('LISTENING ON CONTRACT EVENT', {
            meta:{
                eventName,
                contractAddress
            }
        });

        // Generate the event signature
        const eventSignature = web3.utils.sha3(eventName);
        if (!eventSignature) {
            logger.error(`Failed to generate event signature for ${eventName}.`);
            return;
        }

        // Subscribe to logs for the specified event
        const subscription = web3.eth.subscribe('logs', {
            address: contractAddress,
            topics: [eventSignature], // Filtering for the specific event
        });

        logger.info('Subscription created', {
            meta: { subscription },
        });

        (await subscription).on('data', async (log: any) => {
            const { transactionHash } = log;

            logger.log('NEW TRANSACTION DETECTED', `New transaction detected for ${eventName}: ${transactionHash}`);

            // Call the provided log handler
            await logHandler(transactionHash);
        });
    } catch (error) {
        logger.error(`Something went wrong in the listenOnUniverseContractEvent for ${eventName}`, {
            meta: { error },
        });
    }
};



// Listen for SellPlanet events

export const universe_contract_event_listener = async() => {
    const handleBuyPlanetLog = async (transactionHash: string) => {
        await fetchEventDataFromTransactionUniverse(transactionHash);
    };

    const handlePackageBuyLog = async (transactionHash: string) => {   
        await fetchEventDataFromTransactionUniversePackageBuy(transactionHash);
    }


    await listenOnUniverseContractEvent(
        'Threeby3Transfer(address,address,uint256,uint256,uint256)',
        config.UNIVERSE_CONTRACT_ADDRESS!,
        handleBuyPlanetLog
    );

    await listenOnUniverseContractEvent(
        'PackageBuy(address,uint256,uint256,uint256)',
        config.UNIVERSE_CONTRACT_ADDRESS!,
        handlePackageBuyLog
    );




 

}
