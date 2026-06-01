import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.delete('/:id', commentController.deleteComment);

export default router;
