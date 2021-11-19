import { Worker, Queue, QueueScheduler } from 'bullmq';
import * as path from 'path';

import { config, env } from "../../../lib/config.js";

const queueName = `scrapeJobs_${env}`;

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
    // console.log(`${job.id} has completed!`);
});

worker.on('error', err => {
    // log the error
    console.error(err);
});

worker.on('failed', (job, err) => {
    console.error(`${job.id} has failed with ${err.message}`);
});

export async function initJobs() {
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

};
