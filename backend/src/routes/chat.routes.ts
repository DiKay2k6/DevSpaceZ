import { Router } from 'express';
import { getMessagesByBoard, sendMessage } from '../controllers/chat.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Áp dụng middleware kiểm tra đăng nhập cho tất cả routes chat
router.use(protect);

// Route: /api/v1/chat
router.get('/:boardId', getMessagesByBoard);
router.post('/', sendMessage);

export default router;
