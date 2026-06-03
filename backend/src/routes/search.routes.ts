import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect); // Phải đăng nhập mới được tìm kiếm

router.get('/', searchController.globalSearch);

export default router;
