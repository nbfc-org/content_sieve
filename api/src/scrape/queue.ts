import { Worker, Queue } from 'bullmq';

const queueName = "scrapeJobs";

const queue = new Queue(queueName);

const worker = new Worker(queueName, async job => {
    // Will print { foo: 'bar'} for the first job
    // and { qux: 'baz' } for the second.
    console.log(job.data);
});

worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.error(`${job.id} has failed with ${err.message}`);
});

export async function initJobs() {
    await queue.add(
        'bird',
        { color: 'bird' },
        {
            repeat: {
                every: 10000,
                limit: 100,
            },
        }
    );
};
