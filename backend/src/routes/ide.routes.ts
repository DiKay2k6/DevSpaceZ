import { Router } from 'express';
import { ideController } from '../controllers/ide.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint thực thi mã nguồn
router.post('/execute', protect, ideController.executeCode);

export default router;
