import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả route đều yêu cầu đăng nhập
router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
