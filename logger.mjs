import exp from 'constants';
import log4js from 'log4js'

log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: { type: 'file', filename: 'logs/log4jsconnect.log' },
    },
    categories: {
        default: { appenders: ['console'], level: 'debug' },
        log4jslog: { appenders: ['file'], level: 'debug' },
    },
});


export const logger = log4js.getLogger();
logger.level = 'debug'

export function AppLoger() {
    return log4js.connectLogger(logger, { level: 'auto' })
}