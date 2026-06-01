import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/metrics', dashboardController.getDashboardMetrics);

export default router;
