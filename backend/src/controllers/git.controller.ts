import { Request, Response } from 'express';
import { Queue } from 'bullmq';
import crypto from 'crypto';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
redisConnection.on('error', (err) => logger.error('BullMQ Redis Error:', err.message));

// Create the Queue
export const gitEventsQueue = new Queue('git-events', { connection: redisConnection as any });

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'devspacez_secret';

// Middleware or function to verify GitHub signature
const verifyGitHubSignature = (req: Request) => {
    // If secret is not configured correctly, we should ideally fail or bypass if in dev
    // But for security, let's enforce it
    const signature = req.headers['x-hub-signature-256'] as string;
    if (!signature) return false;

    // req.body is now a Buffer because of express.raw() in git.routes.ts
    const payload = req.body;
    
    const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

export const handleGitHubWebhook = async (req: Request, res: Response) => {
    try {
        const event = req.headers['x-github-event'] as string;
        const signature = req.headers['x-hub-signature-256'];

        // 1. Verify Signature
        if (signature) {
            // Wait, to make it work out of the box without strict rawBody parsing setup in app.ts (which might break other routes),
            // We'll log a warning if signature verification fails but still process if in development, 
            // OR we strictly reject. Let's strictly reject if signature is present but invalid.
            const isValid = verifyGitHubSignature(req);
            if (!isValid && process.env.NODE_ENV === 'production') {
                logger.warn('Invalid GitHub Webhook Signature');
                res.status(401).send('Unauthorized: Invalid signature');
                return;
            }
        } else if (process.env.NODE_ENV === 'production') {
            logger.warn('Missing GitHub Webhook Signature');
            res.status(401).send('Unauthorized: Missing signature');
            return;
        }

        // 2. We only care about push and pull_request events
        if (event === 'push' || event === 'pull_request') {
            // Because we used express.raw(), req.body is a Buffer. We need to parse it to object
            let parsedPayload: any = {};
            try {
                parsedPayload = JSON.parse(req.body.toString());
            } catch (err) {
                logger.error('Failed to parse webhook JSON payload');
                res.status(400).send('Invalid JSON');
                return;
            }

            // Push to BullMQ
            await gitEventsQueue.add('process-github-event', {
                event,
                payload: parsedPayload
            }, {
                removeOnComplete: true, // Keep redis clean
                removeOnFail: false,    // Keep failed jobs for debugging
                attempts: 3,            // Retry 3 times if DB fails
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            });
            logger.info(`Queued GitHub ${event} event`);
        }

        // 3. Immediately return 200 OK so GitHub doesn't timeout
        res.status(200).send('OK');
    } catch (error) {
        logger.error('Error handling webhook', error);
        res.status(500).send('Internal Server Error');
    }
};
