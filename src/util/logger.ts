/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { createLogger, format, transports } from 'winston'
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports'
import util from 'util'
import config from '../config/config'
import { ApplicationEnvironment } from '../constant/application'
import path from 'path'
import * as sourceMapSupport from 'source-map-support'
import { red ,yellow,blue,green,magenta} from 'colorette'

sourceMapSupport.install()


const colorizeLevel = (level:string) =>{
    switch(level){
        case 'ERROR':
            return red(level)
        case 'INFO':
            return blue(level)
        case 'WARN':
            return yellow(level)
        default:
            return level
    }
}

const consoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info

    const customLevel = colorizeLevel(level.toUpperCase())
    const customTimestamp = green(timestamp as string)

    const customMessage = message

    const customMeta = util.inspect(meta, {
        showHidden: false,
        depth: null,
        colors:true
    })

    const customLog = `${customLevel} [${customTimestamp}] ${customMessage}\n${magenta('META')} ${customMeta}\n`

    return customLog
})

const fileLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info;

    const logMeta: Record<string, unknown> = {};

    if (typeof meta === 'object' && meta !== null) {
        for (const [key, value] of Object.entries(meta)) {
            if (value instanceof Error) {
                logMeta[key] = {
                    name: value.name,
                    message: value.message,
                    trace: value.stack || ''
                };
            } else {
                logMeta[key] = value;
            }
        }
    }

    const logData = {
        level: level.toUpperCase(),
        message,
        timestamp,
        meta: logMeta
    };

    return JSON.stringify(logData, null, 4);
});


const consoleTransport = (): Array<ConsoleTransportInstance> => {
    if (config.ENV === ApplicationEnvironment.DEVELOPMENT) {
        return [
            new transports.Console({
                level: 'info',
                format: format.combine(format.timestamp(), consoleLogFormat)
            })
        ]
    }

    return []
}

const fileTransport = ():Array<FileTransportInstance> =>{

    return[
        new transports.File({
            filename:path.join(__dirname,'../','../','logs',`${config.ENV}.log`),
            level:'info',
            format:format.combine(format.timestamp(),fileLogFormat)
        })
    ]
}

export default createLogger({
    defaultMeta: {
        meta: {}
    },
    transports: [...fileTransport(),...consoleTransport()]
})
