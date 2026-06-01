import express from 'express';
import { ideContainerController } from '../controllers/ideContainer.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect); // Bắt buộc đăng nhập

router.post('/start', ideContainerController.startLspContainer);

export default router;
