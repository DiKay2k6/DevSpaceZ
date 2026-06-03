import express from 'express';
import { handleGitHubWebhook } from '../controllers/git.controller';

const router = express.Router();

// Webhook endpoint: POST /api/v1/git/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), handleGitHubWebhook);

export default router;
