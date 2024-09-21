import { CronJob } from 'cron';
import { AppEnv } from './env.mjs';
import { logger } from './logger.mjs';
import { tableSplit, deleteTable } from './db.mjs';

export function startCron() {
    const job = new CronJob(
        AppEnv.cronTime,
        async function () {
            logger.info('cron start')
            await tableSplit()
            await deleteTable()
        },
        function () {
            logger.info('cron complete')
        },
        true,
        AppEnv.timeZone
    );
}