import { Router } from 'express';
import { boardController } from '../controllers/board.controller';
import { protect } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';

const router = Router();

// Toàn bộ API của Board đều cần phải đăng nhập
router.use(protect);

router.get('/', boardController.getAllBoards);
router.get('/:id', boardController.getBoardDetails);
router.post('/', boardController.createBoard);
router.put('/:id', requirePermission('board:edit', 'Board', 'params.id'), boardController.updateBoard);
router.delete('/:id', requirePermission('board:delete', 'Board', 'params.id'), boardController.deleteBoard);

export default router;
