import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import pino from 'pino';

const log = pino({ name: 'conference-worker' });
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

new Worker('antivirusScan', async (job) => {
  log.info({ jobId: job.id, uploadFileId: job.data.uploadFileId }, 'Run ClamAV scan (stub)');
}, { connection });

new Worker('generatePreview', async (job) => {
  log.info({ jobId: job.id, uploadFileId: job.data.uploadFileId }, 'Run LibreOffice preview generation (stub)');
}, { connection });

new Worker('zipInspect', async (job) => {
  log.info({ jobId: job.id, uploadFileId: job.data.uploadFileId }, 'Run zip inspection (stub)');
}, { connection });

new Worker('housekeeping', async () => {
  log.info('Run retention/cleanup task (stub)');
}, { connection });

log.info('Workers are running');
