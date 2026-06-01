import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { protect } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.use(protect);

router.get('/', documentController.getAll);
router.post('/', requirePermission('document:create', 'Workspace', 'body.workspaceId'), documentController.create);
router.post('/import', upload.single('file'), requirePermission('document:create', 'Workspace', 'body.workspaceId'), documentController.importWord);
router.get('/:id', documentController.getById);
router.post('/translate', documentController.translateContent);
router.get('/:id/export/word', documentController.exportWord);
router.put('/:id', requirePermission('document:edit', 'Document', 'params.id'), documentController.update);
router.patch('/:id/collaborators', requirePermission('document:edit', 'Document', 'params.id'), documentController.updateCollaborators);
router.patch('/:id/move', requirePermission('document:edit', 'Document', 'params.id'), documentController.move);
router.delete('/:id', requirePermission('document:delete', 'Document', 'params.id'), documentController.delete);

export default router;
