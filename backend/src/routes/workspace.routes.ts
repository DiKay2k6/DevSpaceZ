import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller';
import { protect } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { workspaceFileController } from '../controllers/workspaceFile.controller';
import { ideAuth } from '../middlewares/ideAuth.middleware';

const router = Router();

router.use(protect);

router.get('/', workspaceController.getWorkspacesByOrg);
router.post('/cloud', workspaceController.createCloudWorkspace);
router.get('/all/activities', workspaceController.getAllActivities);
router.get('/:id/activities', workspaceController.getActivities);
router.get('/:id/members', workspaceController.getMembers);
router.get('/:id/workload', workspaceController.getMembersWorkload);
router.post('/:id/members', requirePermission('member:invite', 'Workspace', 'params.id'), workspaceController.addMember);
router.delete('/:id/members/:userId', requirePermission('member:remove', 'Workspace', 'params.id'), workspaceController.removeMember);
router.put('/:id/members/:userId', requirePermission('member:change_role', 'Workspace', 'params.id'), workspaceController.updateMember);

router.post('/:id/subteams', workspaceController.addSubTeam);
router.delete('/:id/subteams/:subTeamId', workspaceController.removeSubTeam);

router.get('/:id/workspace', ideAuth, workspaceFileController.getWorkspaceFiles);
router.get('/:id/files/permissions', ideAuth, workspaceFileController.getFilePermissions);
router.put('/:id/files/permissions', ideAuth, workspaceFileController.updatePermissions);
router.put('/:id/files', ideAuth, workspaceFileController.saveFile);
router.post('/:id/files', ideAuth, workspaceFileController.createFile);
router.delete('/:id/files', ideAuth, workspaceFileController.deleteFile);

export default router;
