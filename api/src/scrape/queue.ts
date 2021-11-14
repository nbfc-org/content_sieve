import { Worker, Queue, QueueScheduler } from 'bullmq';
import * as path from 'path';

import { config } from "../../../lib/config.js";

const queueName = "scrapeJobs";
const repeatEvery = 30 * 60; // seconds

const { connection } = config.scrape;

const _queueScheduler = new QueueScheduler(queueName, { connection });
const queue = new Queue(queueName, { connection });

const processorFile = path.join(__dirname, 'get_links.js');
const worker = new Worker(
    queueName,
    processorFile,
    { connection },
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
    const jobId = 'getLinksMefi';
    try {
        const jobs = await queue.getRepeatableJobs();
        for (const job of jobs) {
            await queue.removeRepeatableByKey(job.key);
        }
    } catch(e) {
        console.error(e);
    }

    await queue.add(
        jobId,
        { key: 'mefi' },
        {
            //removeOnFail: true,
            //removeOnComplete: true,
            jobId,
            repeat: {
                every: repeatEvery * 1000 / 2,
            },
        }
    );
};
