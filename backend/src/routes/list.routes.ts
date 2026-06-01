import { Router } from 'express';
import { listController } from '../controllers/list.controller';
import { protect } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';

const router = Router();

router.use(protect);

router.post('/', requirePermission('list:create', 'Board', 'body.boardId'), listController.createList);
router.put('/move', requirePermission('list:edit', 'List', 'body.items'), listController.moveList);
router.put('/:id', requirePermission('list:edit', 'List', 'params.id'), listController.updateList);
router.delete('/:id', requirePermission('list:delete', 'List', 'params.id'), listController.deleteList);

export default router;
