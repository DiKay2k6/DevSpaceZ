import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { User } from '../models/user.model';
import { GitDailyStat } from '../models/gitStat.model';
import { logger } from '../utils/logger';

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Utility to start the day at 00:00:00 UTC
const getStartOfDay = (dateString: string | Date) => {
    const d = new Date(dateString);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

// Extractor logic
const processGitEvent = async (job: Job) => {
    const { event, payload } = job.data;
    
    logger.info(`Processing Git Event: ${event} from Job ${job.id}`);

    if (event === 'push') {
        const commits = payload.commits || [];
        if (commits.length === 0) return;

        // Group commits by author email
        const authorStats = new Map<string, { commits: number, added: number, removed: number, date: Date }>();

        commits.forEach((commit: any) => {
            const email = commit.author?.email;
            if (!email) return;

            // GitHub gives us arrays of added, removed, modified files. 
            // In a webhook payload, we might not get exact line counts per commit unless we fetch it.
            // But wait! GitHub webhook push event DOES NOT include `linesAdded` directly.
            // However, we can approximate by checking length of `added` and `removed` arrays as file counts for now, 
            // or if the payload contains `additions` / `deletions` at some level.
            // We'll just count the commit itself to keep it simple, and fallback added/removed to file counts.
            const added = commit.added?.length || 0;
            const removed = commit.removed?.length || 0;
            const date = getStartOfDay(commit.timestamp || new Date());

            if (!authorStats.has(email)) {
                authorStats.set(email, { commits: 0, added: 0, removed: 0, date });
            }
            
            const stats = authorStats.get(email)!;
            stats.commits += 1;
            stats.added += added;
            stats.removed += removed;
        });

        for (const [email, stats] of authorStats.entries()) {
            // Find user by email. We can also handle noreply github emails if needed.
            // GitHub noreply format: ID+USERNAME@users.noreply.github.com
            // We will do a basic search by email.
            let user = await User.findOne({ email });

            if (!user && email.includes('noreply.github.com')) {
                // If the email is a noreply email, try to extract username and match
                const usernameMatch = email.match(/\+([^@]+)@/);
                if (usernameMatch && usernameMatch[1]) {
                    const username = usernameMatch[1];
                    // This is a naive match, usually users have full_name or email prefix matching username
                    // A proper way is to link GitHub accounts, which we do via OAuth!
                    // In a perfect system, we'd look up auth_providers.provider_id
                    // But for this enterprise mock, we'll try to find by regex on email or name
                    user = await User.findOne({ email: new RegExp(`^${username}@`, 'i') });
                }
            }

            if (!user) {
                logger.warn(`Could not find user in DB with email: ${email}`);
                continue;
            }

            // Upsert into GitDailyStat
            await GitDailyStat.findOneAndUpdate(
                { userId: user._id, date: stats.date },
                {
                    $inc: {
                        commits: stats.commits,
                        linesAdded: stats.added,
                        linesDeleted: stats.removed
                    }
                },
                { upsert: true, new: true }
            );
        }
    } else if (event === 'pull_request') {
        const action = payload.action;
        const pr = payload.pull_request;
        if (action === 'closed' && pr?.merged === true) {
            const mergedByEmail = payload.sender?.email || pr.user?.email; // GitHub payload sender doesn't always have email without fetching.
            // Actually, for pull_request events, it might be tricky to get the exact email from the payload.
            // We might just get `sender.login`.
            // We'll assume the email might be present or we do best effort matching on login.
            const login = payload.sender?.login;

            let user = null;
            if (mergedByEmail) {
                user = await User.findOne({ email: mergedByEmail });
            } 
            if (!user && login) {
                // Best effort finding by name containing login (since Github login usually matches part of name or email)
                user = await User.findOne({ email: new RegExp(`^${login}@`, 'i') });
            }

            if (user) {
                const date = getStartOfDay(pr.merged_at || new Date());
                await GitDailyStat.findOneAndUpdate(
                    { userId: user._id, date },
                    {
                        $inc: {
                            prsMerged: 1
                        }
                    },
                    { upsert: true, new: true }
                );
            }
        }
    }
};

export const startGitWorker = () => {
    const worker = new Worker('git-events', processGitEvent, {
        connection: redisConnection as any,
        concurrency: 5, // Can process 5 webhooks concurrently
    });

    worker.on('completed', job => {
        logger.info(`[GitWorker] Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
        logger.error(`[GitWorker] Job ${job?.id} failed with error: ${err.message}`);
    });

    logger.info('🚀 Git Worker is listening for events...');
};
