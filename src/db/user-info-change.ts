import { prisma } from '../app'
import logger from '../util/logger'

export async function updateAddresses() {
    const targetAddress = '0x16E5AEd297Bc44b127476a0466Dff0fC2c4C2740'
    const newAddress = '0xD0983fcDA48D72B16047488bA08DE925057F3076'

    // Update records where wallet_address matches the target address
    const walletAddressUpdate = await prisma.earningHistory.updateMany({
        where: { reg_user_address: targetAddress },
        data: { reg_user_address: newAddress }
    })

    // Update records where sponser_address matches the target address
    // const sponserAddressUpdate = await prisma.user.updateMany({
    //   where: { sponser_address: targetAddress },
    //   data: { sponser_address: newAddress },
    // });

    logger.log('Updated  records for wallet_address',walletAddressUpdate.count)
    // console.log(`Updated ${sponserAddressUpdate.count} records for sponser_address`);
}

