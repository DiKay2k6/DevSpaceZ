import { Router } from 'express';
import { updateMe, uploadAvatar, changePassword, searchUsers, togglePinBoard, getUserProfile } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { uploadAvatar as uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

// Tất cả các routes liên quan đến user đều yêu cầu phải đăng nhập
router.use(protect);

// 1. Cập nhật thông tin cơ bản
router.put('/me', updateMe);

// 2. Tìm kiếm users (mời bạn bè)
router.get('/search', searchUsers);

// 3. Upload avatar
router.post('/me/avatar', uploadMiddleware.single('avatar'), uploadAvatar);

// 4. Đổi mật khẩu
router.put('/me/password', changePassword);

// 5. Ghim dự án
router.post('/me/pinned-boards/:boardId', togglePinBoard);

// 6. Lấy profile public của user
router.get('/:id/profile', getUserProfile);

export default router;
