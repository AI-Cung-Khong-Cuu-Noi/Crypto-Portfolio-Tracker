import { Router } from 'express';
import {
  getReportsSummary,
  getReportsTaxRealized,
  getReportsByCoin,
} from '../controllers/reports.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  reportsSummaryQuerySchema,
  reportsTaxQuerySchema,
  reportsByCoinQuerySchema,
} from '../validations/reports.validation';

const router = Router();

router.use(authenticateToken);

router.get('/summary', validate(reportsSummaryQuerySchema), getReportsSummary);
router.get('/tax-realized', validate(reportsTaxQuerySchema), getReportsTaxRealized);
router.get('/by-coin', validate(reportsByCoinQuerySchema), getReportsByCoin);

export default router;
