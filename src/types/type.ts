


export type HttpResponse ={
    success:boolean
    statusCode:number
    request: {
        ip?: string | null
        method:string
        url:string
    }
    message:string
    data:unknown
}


export type HttpError ={
    success:boolean
    statusCode:number
    request: {
        ip?: string | null
        method:string
        url:string
    }
    message:string
    data:unknown
    trace?:object | null
}

