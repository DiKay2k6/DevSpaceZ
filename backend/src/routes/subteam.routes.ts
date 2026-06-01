import express from 'express';
import { subteamController } from '../controllers/subteam.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Tất cả các routes đều cần đăng nhập
router.use(protect);

// Tổ chức (Organization) routes
router.post('/', subteamController.createSubTeam);
router.get('/org/:orgId', subteamController.getSubTeamsByOrg);

// Chi tiết một SubTeam
router.put('/:id', subteamController.updateSubTeam);
router.delete('/:id', subteamController.deleteSubTeam);
router.post('/:id/members', subteamController.addMembers);
router.delete('/:id/members/:userId', subteamController.removeMember);
router.put('/:id/members/:userId/role', subteamController.updateMemberRole);

export default router;
