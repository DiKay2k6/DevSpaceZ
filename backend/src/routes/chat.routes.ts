import { Router } from 'express';
import { getMessages, sendMessage, getConversations, findOrCreateConversation } from '../controllers/chat.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Áp dụng middleware kiểm tra đăng nhập cho tất cả routes chat
router.use(protect);

// Route: /api/v1/chat
router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.get('/conversations', getConversations);
router.post('/conversations', findOrCreateConversation);

export default router;
