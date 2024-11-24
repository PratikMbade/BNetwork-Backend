import { Prisma } from '@prisma/client'


export type HttpResponse = {
    success: boolean
    statusCode: number
    request: {
        ip?: string | null
        method: string
        url: string
    }
    message: string
    data: unknown
}

export type HttpError = {
    success: boolean
    statusCode: number
    request: {
        ip?: string | null
        method: string
        url: string
    }
    message: string
    data: unknown
    trace?: object | null
}

export interface UniversePlanetBuyTypes {
    wallet_address: string
    sponser_address: string
    planetId: number
    planetPrice: number
    planetName: string
}

type PlanetDetails = {
    planetNum: number
    planetName: string
    planetPrice: number
}

type PlanetDetailsCosmos = {
    planetNum: number;
    planetName: string;
    planetPrice: number;
    rewardCoinAmount:number;
  };

const PlanetDetailsMapCosmos: Record<number, PlanetDetailsCosmos> = {
    1: { planetNum: 1, planetName: 'Earth', planetPrice: 5, rewardCoinAmount: 0.1 },
    2: { planetNum: 2, planetName: 'Moon', planetPrice: 10, rewardCoinAmount: 0.2 },
    3: { planetNum: 3, planetName: 'Mars', planetPrice: 25, rewardCoinAmount: 0.4 },
    4: { planetNum: 4, planetName: 'Mercury', planetPrice: 50, rewardCoinAmount: 0.8 },
    5: { planetNum: 5, planetName: 'Venus', planetPrice: 100, rewardCoinAmount: 1.6 },
    6: { planetNum: 6, planetName: 'Jupiter', planetPrice: 250, rewardCoinAmount: 3.2 },
    7: { planetNum: 1, planetName: 'Saturn', planetPrice: 500, rewardCoinAmount: 6.4 },
    8: { planetNum: 2, planetName: 'Uranus', planetPrice: 1000, rewardCoinAmount: 12.8 },
    9: { planetNum: 3, planetName: 'Neptune', planetPrice: 2500, rewardCoinAmount: 15.0 },
    10: { planetNum: 4, planetName: 'Pluto', planetPrice: 5000, rewardCoinAmount: 20.0 }
}

export const getCosmosPlanetDetailsById = (planetId: number): PlanetDetailsCosmos => {
    return PlanetDetailsMapCosmos[planetId] || null
}

const PlanetDetailsMapUniverse: Record<number, PlanetDetails> = {
    1: { planetNum: 1, planetName: 'Earth', planetPrice: 10 },
    2: { planetNum: 2, planetName: 'Moon', planetPrice: 25 },
    3: { planetNum: 3, planetName: 'Mars', planetPrice: 50 },
    4: { planetNum: 4, planetName: 'Mercury', planetPrice: 100 },
    5: { planetNum: 5, planetName: 'Venus', planetPrice: 250 },
    6: { planetNum: 6, planetName: 'Jupiter', planetPrice: 500 },
    7: { planetNum: 1, planetName: 'Saturn', planetPrice: 1000 },
    8: { planetNum: 2, planetName: 'Uranus', planetPrice: 2500 },
    9: { planetNum: 3, planetName: 'Neptune', planetPrice: 5000 },
    10: { planetNum: 4, planetName: 'Pluto', planetPrice: 10000 }
}

export const getUniversePlanetDetailsById = (planetId: number): PlanetDetails => {
    return PlanetDetailsMapUniverse[planetId] || null
}

export interface RegisterUserRequestBody {
    publicAddress:string
    sponsorAddress: string
    regId: number
}


export interface BuyPlanetCosmosRequestBody {
    wallet_address: string
    planetId: number
}

export interface BuyPlanetUniverseRequestBody{
    planetId:number
    wallet_address:string
    direct_sponser:string
    upgrade_sponser:string
    firstThreeby3Sponser:string
    firstThreeby3SponserChainId:number
    secondThreeby3Sponser:string
    secondThreeby3SponserChainId:number
    thirdThreeby3Sponser:string
    thirdThreeby3SponserChainId:number

}


export type ThirdSponserType = Prisma.UniverseMatrixEarningTreeGetPayload<{
    include:{
        threeChild:true;
        matrixChildren:true;
        universeMatrixEarningHistory:true;
    }
}>

interface ChildPosition {
    position: number;
    level: number;
  };
  
 export interface FindPositionAndLevelResult {
    firstChild: ChildPosition;
    secondChild: ChildPosition;
    thirdChild: ChildPosition;
  };
  

 export interface FindSpaceUnierse3x3ReturnType{
   position:number;
   level:number;
}