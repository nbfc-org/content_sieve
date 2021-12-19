// import { Worker, Queue, QueueScheduler } from 'bullmq';
// import * as path from 'path';

import * as PgBoss from 'pg-boss';
import { scrapeHandler } from './get_links.js';

import { config, env } from "../../../lib/config.js";

const queueName = `scrapeJobs_${env}`;

/*
const { connection } = config.scrape;

const _queueScheduler = new QueueScheduler(queueName, { connection });
const queue = new Queue(queueName, { connection });

const processorFile = path.join(__dirname, 'get_links.js');
const worker = new Worker(
    queueName,
    processorFile,
    { connection, concurrency: 5 },
);

worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on('error', err => {
    // log the error
    console.error(err);
});

worker.on('failed', (job, err) => {
    console.error(`${job.id} has failed with ${err.message}`);
});

async function someAsyncJobHandler(job) {
    console.log(`job ${job.id} received with data:`);
    console.log(JSON.stringify(job.data));

    // await doSomethingAsyncWithThis(job.data);
}
*/

export async function initPGBoss() {
    const { enabled, boss: dbconfig } = config.scrape;

    if (!enabled) {
        return;
    }

    const { host, port, database, password } = dbconfig;
    const boss = new PgBoss(`postgres://postgres:${password}@${host}:${port}/${database}`);

    boss.on('error', error => console.error(error));

    await boss.start();

    // let jobId = await boss.publish(queueName, { key: 'mefi' })
    // let hnjobId = await boss.publish(queueName, { key: 'hn' })

    await boss.subscribe(queueName, scrapeHandler);

    await boss.schedule(queueName,
                        `1-59/2 * * * *`,
                        { key: 'mefi'},
                        { tz: 'America/Los_Angeles' })
}

export async function initJobs() {
    await initPGBoss();

    /*
    // TOOD: re-enable bullmq jobs?
    return;

    try {
        const jobs = await queue.getRepeatableJobs();
        for (const job of jobs) {
            await queue.removeRepeatableByKey(job.key);
        }
    } catch(e) {
        console.error(e);
    }

    let jobId = 'getLinksMefi';
    await queue.add(
        jobId,
        { key: 'mefi' },
        {
            //removeOnFail: true,
            //removeOnComplete: true,
            jobId,
            repeat: {
                every: config.scrape.repeatEvery * .9 * 1000 / 2,
            },
        }
    );

    jobId = 'getLinksHN';
    await queue.add(
        jobId,
        { key: 'hn' },
        {
            //removeOnFail: true,
            //removeOnComplete: true,
            jobId,
            repeat: {
                every: config.scrape.repeatEvery * 1.1 * 1000 / 2,
            },
        }
    );
    */
};
