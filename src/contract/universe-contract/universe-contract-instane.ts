import { ethers } from 'ethers'
import config from '../../config/config'
import universe_contract_abi from '../universe-contract/universe-abi.json'


export  function getUniverseContractInstance() {
    // Create a provider connected to your desired network
    const provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/opbnb')

    // Create a contract instance
    const universeContract = new ethers.Contract(config.UNIVERSE_CONTRACT_ADDRESS!, universe_contract_abi, provider)



    return universeContract
}

