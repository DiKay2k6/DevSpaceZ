import { Router } from 'express';
import { chatWithAI, generateKanbanTasks } from '../controllers/ai.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// API chat với Assistant (Yêu cầu đăng nhập)
router.post('/chat', protect, chatWithAI);

// API tự động tạo Kanban tasks (Yêu cầu đăng nhập)
router.post('/generate-board', protect, generateKanbanTasks);

export default router;
