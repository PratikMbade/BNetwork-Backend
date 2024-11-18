import { prisma } from '../../app'




export const registerNewUser = async (publicAddress: string, sponsorAddress: string) => {
    const userExists = await prisma.user.findFirst({ where: { wallet_address: publicAddress } })

    if(userExists){
        throw new Error('User already registered')

    }

    const sponsor = await prisma.user.findFirst({
        where: { wallet_address: sponsorAddress },
        include: { bnCoinEarned: true, direct_team: true }
    })

    if (!sponsor) {
        throw new Error('Sponsor is not registered')
    }

    const last8Characters = publicAddress.slice(-8)
    const newBNId = 'BN' + last8Characters

    const BNMaxRewardsCoins = await prisma.bNCoinConfig.findUnique({
        where: { key: 'BNMaxRewardsCoins' }
    })

    if (!BNMaxRewardsCoins) {
        throw new Error('Configuration not found')
    }

    let bnCoinRegistration = 0
    let bnCoinSponserReward = 0

    if (BNMaxRewardsCoins.BNCoinDistributed! + 0.075 < BNMaxRewardsCoins.BNMaxRewardsCoins) {
        bnCoinRegistration = 0.05
        bnCoinSponserReward = 0.025
    }

    const newUser = await prisma.user.create({
        data: {
            wallet_address: publicAddress,
            sponser_address: sponsorAddress,
            bn_id: newBNId,
            isRegistered: true,
            bnCoinEarned: {
                create: {
                    bn_id: newBNId,
                    wallet_address: publicAddress,
                    amount: bnCoinRegistration,
                    timeStamp: new Date()
                }
            }
        }
    })

    await prisma.user.upsert({
        where: { wallet_address: sponsor.wallet_address },
        update: { directTeam_Count: { increment: 1 } },
        create: { wallet_address: sponsor.wallet_address, directTeam_Count: 1 }
    })

    await prisma.user.update({
        where: { id: sponsor.id },
        data: {
            direct_team: {
                create: { wallet_address: newUser.wallet_address, id: newUser.id }
            },
            bnCoinEarned: {
                create: {
                    bn_id: newUser.bn_id!,
                    wallet_address: newUser.wallet_address,
                    amount: bnCoinSponserReward,
                    timeStamp: new Date()
                }
            }
        }
    })

    await prisma.bNCoinConfig.update({
        where: { key: 'BNMaxRewardsCoins' },
        data: {
            BNCoinDistributed: { increment: bnCoinRegistration + bnCoinSponserReward },
            BNMaxAirDropCoins: { decrement: bnCoinRegistration + bnCoinSponserReward }
        }
    })

    return newUser
}

