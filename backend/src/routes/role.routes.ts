import { Router } from 'express';
import { roleController } from '../controllers/role.controller';
import { protect, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

// Toàn bộ API Role đều yêu cầu đăng nhập
router.use(protect);

router.route('/')
    .get(roleController.getRoles)
    // Chỉ những người có quyền sửa workspace (hoặc owner) mới được tạo role
    .post(requirePermission('workspace:edit' as any), roleController.createRole);

router.route('/:id')
    .put(requirePermission('workspace:edit' as any), roleController.updateRole)
    .delete(requirePermission('workspace:edit' as any), roleController.deleteRole);

export default router;
