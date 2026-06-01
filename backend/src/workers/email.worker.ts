import { Worker, Job } from 'bullmq';
import { sendEmail } from '../utils/email.util';

const connection = {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
};

/**
 * Worker xử lý hàng đợi 'emailQueue'
 */
const emailWorker = new Worker('emailQueue', async (job: Job) => {
    const { to, subject, html } = job.data;
    
    console.log(`[Email Worker] Đang gửi email tới ${to}... (Job ID: ${job.id})`);
    
    try {
        await sendEmail(to, subject, html);
        console.log(`[Email Worker] Gửi thành công tới ${to} (Job ID: ${job.id})`);
    } catch (error) {
        console.error(`[Email Worker] Lỗi gửi email tới ${to}:`, error);
        throw error; // Ném lỗi để BullMQ tự động retry
    }
}, { 
    connection,
    concurrency: 5 // Xử lý đồng thời 5 email
});

emailWorker.on('completed', (job) => {
    console.log(`[Email Worker] Job ${job.id} hoàn tất.`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`[Email Worker] Job ${job?.id} thất bại: ${err.message}`);
});

export default emailWorker;
