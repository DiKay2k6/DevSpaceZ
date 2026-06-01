import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/overview', analyticsController.getOverviewMetrics);
router.get('/projects', analyticsController.getProjectMetrics);
router.get('/teams', analyticsController.getTeamMetrics);

export default router;
