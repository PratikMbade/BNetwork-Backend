import { ethers } from 'ethers'
import config from '../../config/config'
import cosmos_contract_abi from '../cosmos-contract/cosmos-abi.json'

export function getUniverseContractInstance(): ethers.Contract {
    // Create a provider connected to your desired network
    const provider = new ethers.providers.JsonRpcProvider('https://opbnb-rpc.publicnode.com')

    // Create a contract instance
    const universeContract = new ethers.Contract(config.COSMOS_CONTRACT_ADDRESS!, cosmos_contract_abi, provider)

    return universeContract
}

