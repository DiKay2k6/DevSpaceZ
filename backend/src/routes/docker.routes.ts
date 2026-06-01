import { Router } from 'express';
import { dockerController } from '../controllers/docker.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/stats', dockerController.getStats);

export default router;
