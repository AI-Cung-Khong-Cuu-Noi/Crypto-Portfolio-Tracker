import { Router } from 'express';
import {
  getAdminUserDetail,
  getAdminUsers,
  resetAdminUserPassword,
  softDeleteAdminUser,
  updateAdminUser,
  updateAdminUserStatus,
} from '../controllers/admin.user.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  adminGetUsersSchema,
  adminResetPasswordSchema,
  adminUpdateUserSchema,
  adminUpdateUserStatusSchema,
  adminUserIdParamSchema,
} from '../validations/admin.validation';

const router = Router();

router.use(authenticateToken, authorizeRoles('ADMIN'));

router.get('/', validate(adminGetUsersSchema), getAdminUsers);
router.get('/:id', validate(adminUserIdParamSchema), getAdminUserDetail);
router.put('/:id', validate(adminUpdateUserSchema), updateAdminUser);
router.post('/:id/reset-password', validate(adminResetPasswordSchema), resetAdminUserPassword);
router.patch('/:id/status', validate(adminUpdateUserStatusSchema), updateAdminUserStatus);
router.delete('/:id', validate(adminUserIdParamSchema), softDeleteAdminUser);

export default router;
