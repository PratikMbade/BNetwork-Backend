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

const PlanetDetailsMap: Record<number, PlanetDetails> = {
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
    return PlanetDetailsMap[planetId] || null
}


export interface RegisterUserRequestBody {
    publicAddress: string;
    sponsorAddress: string;
}