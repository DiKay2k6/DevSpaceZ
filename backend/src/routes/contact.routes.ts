import { Router } from 'express';
import { contactController } from '../controllers/contact.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/search', contactController.searchUsers);
router.post('/', contactController.addContact);
router.get('/', contactController.getContacts);
router.delete('/:friendId', contactController.removeContact);

export default router;
