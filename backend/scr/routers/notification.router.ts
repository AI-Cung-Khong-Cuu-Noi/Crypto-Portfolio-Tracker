import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notification.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
} from '../validations/notification.validation';

const router = Router();

router.use(authenticateToken);

router.get('/', validate(listNotificationsQuerySchema), getNotifications);
router.patch('/:id/read', validate(notificationIdParamSchema), markNotificationRead);
router.post('/read-all', markAllNotificationsRead);

export default router;
