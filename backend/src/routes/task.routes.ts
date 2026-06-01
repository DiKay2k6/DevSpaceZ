import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { commentController } from '../controllers/comment.controller';
import { taskRequestController } from '../controllers/taskRequest.controller';
import { protect } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';

const router = Router();

router.use(protect);

router.post('/', requirePermission('task:create', 'Board', 'body.boardId'), taskController.createTask);
router.put('/move', requirePermission('task:move', 'Task', 'body.items'), taskController.moveTask);
router.put('/:id', requirePermission('task:edit', 'Task', 'params.id'), taskController.updateTask);
router.delete('/:id', requirePermission('task:delete', 'Task', 'params.id'), taskController.deleteTask);
router.post('/:id/attachments', requirePermission('task:edit', 'Task', 'params.id'), taskController.addAttachment);

// Task Requests
router.post('/:taskId/requests', taskRequestController.createRequest);
router.get('/requests/pending', taskRequestController.getPendingRequests);
router.patch('/requests/:id', taskRequestController.processRequest);

// Comments
router.get('/:taskId/comments', commentController.getCommentsByTask);
router.post('/:taskId/comments', commentController.createComment);
router.delete('/:taskId/comments/:id', commentController.deleteComment);

export default router;
