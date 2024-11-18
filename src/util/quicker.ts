import os from 'os'
import config from '../config/config'


 export default{

    getSystemHealth: () => {
        const totalMemoryMB:string = (os.totalmem() / 1024 / 1024).toFixed(2);
        const freeMemoryMB:string = (os.freemem() / 1024 / 1024).toFixed(2);
        const usedMemoryMB = (Number(totalMemoryMB) - Number(freeMemoryMB)).toFixed(2);
        const memoryUsagePercentage = (((Number(totalMemoryMB) - Number(freeMemoryMB)) / Number(totalMemoryMB)) * 100).toFixed(2);

        return {
            cpuUsage: os.loadavg(),
            totalMemory: `${totalMemoryMB} MB`,
            freeMemory: `${freeMemoryMB} MB`,
            usedMemory: `${usedMemoryMB} MB`,
            memoryUsagePercentage: `${memoryUsagePercentage} %`
        };
    },
    getApplicationHealth:() =>{
        return{
            environment:config.ENV,
            uptime: `${process.uptime().toFixed(2)} Second`,
            memoryUsage:{
                heapTotal: `${ (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed:`${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} MB`
            }
        }
    }
 }