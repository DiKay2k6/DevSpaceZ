import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

export const emailQueue = new Queue('emailQueue', {
    connection: connection as any,
    defaultJobOptions: {
        attempts: 3, // Thử lại tối đa 3 lần nếu lỗi
        backoff: {
            type: 'exponential',
            delay: 1000 // Thử lại sau 1s, 2s, 4s...
        },
        removeOnComplete: true, // Xóa khỏi Redis khi xong để tiết kiệm RAM
        removeOnFail: false // Giữ lại nếu lỗi hẳn để debug
    }
});

export const addEmailToQueue = async (to: string, subject: string, html: string) => {
    await emailQueue.add('sendEmail', { to, subject, html });
};
