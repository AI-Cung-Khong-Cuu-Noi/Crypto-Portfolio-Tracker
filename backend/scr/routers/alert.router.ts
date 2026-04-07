import { Router } from 'express';
import { createAlert, getAlerts, updateAlert, deleteAlert } from '../controllers/alert.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createAlertSchema,
  updateAlertSchema,
  alertIdParamSchema,
} from '../validations/alert.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validate(createAlertSchema), createAlert);
router.get('/', getAlerts);
router.patch('/:id', validate(updateAlertSchema), updateAlert);
router.delete('/:id', validate(alertIdParamSchema), deleteAlert);

export default router;
