import { Worker, Queue, QueueScheduler } from 'bullmq';
import * as path from 'path';

import { config } from "../../../lib/config.js";

const queueName = "scrapeJobs";

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
    await queue.add(
        'getLinks',
        { url: 'https://www.metafilter.com/' },
        {
            removeOnFail: true,
            removeOnComplete: true,
            repeat: {
                every: 30000,
            },
        }
    );
};
