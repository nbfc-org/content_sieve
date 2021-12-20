import * as PgBoss from 'pg-boss';
import { scrapeHandler } from './get_links.js';

import { config, env } from "../../../lib/config.js";

const queueName = `scrapeJobs_${env}`;

async function initPGBoss() {
    const { enabled, boss: dbconfig, jobs } = config.scrape;

    if (!enabled) {
        return;
    }

    const { host, port, database, password } = dbconfig;
    const boss = new PgBoss(`postgres://postgres:${password}@${host}:${port}/${database}`);

    boss.on('error', error => console.error(error));

    await boss.start();

    for (const schedule of await boss.getSchedules()) {
        const { name } = schedule;
        console.log(`unscheduling ${name}`);
        boss.unschedule(name);
    }

    for (const key of Object.keys(jobs)) {
        const { cron } = jobs[key];

        const name = `${queueName}_${key}`;
        await boss.subscribe(name, scrapeHandler);

        await boss.schedule(name,
                            cron,
                            { key },
                            { tz: 'America/Los_Angeles' })
    }
}

export async function initJobs() {
    await initPGBoss();
};
