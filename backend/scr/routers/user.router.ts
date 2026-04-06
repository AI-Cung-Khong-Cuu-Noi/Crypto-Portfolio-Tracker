import { Router } from 'express';
import { getMe, updateMe, changePassword } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validations/user.validation';

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

router.get('/me', getMe);
router.put('/me', validate(updateProfileSchema), updateMe);
router.put('/password', validate(changePasswordSchema), changePassword);

export default router;
