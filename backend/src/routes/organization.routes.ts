import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', organizationController.getOrganizations);
router.post('/', organizationController.createOrganization);
router.get('/:id/members', organizationController.getMembers);
router.get('/:id/workload', organizationController.getMembersWorkload);
router.post('/:id/members', organizationController.addMember);
router.post('/:id/accept-invite', organizationController.acceptInvite);
router.delete('/:id/members/:userId', organizationController.removeMember);
router.put('/:id/members/:userId', organizationController.updateMember);

export default router;
