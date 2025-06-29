import { Queue } from 'bullmq';

export const jobQueue = new Queue('jobs', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

// Exemplo de uso:
// await jobQueue.add('email', { to: 'user@email.com', subject: 'Teste' }); 