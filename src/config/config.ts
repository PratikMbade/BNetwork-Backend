import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()


export default {
    
    ENV:process.env.ENV,
    PORT:process.env.PORT,
    SERVER_URL:process.env.SERVER_URL,
    BLOCKCHAIN_WEBSOCKET_URL:process.env.BLOCKCHAIN_WEBSOCKET_URL,
    COSMOS_CONTRACT_ADDRESS:process.env.COSMOS_CONTRACT_ADDRESS,
    DATABASE_URL:process.env.DATABASE_URL
}