import { Router } from 'express';
import {
  getDashboardSummary,
  getDashboardAllocation,
  getDashboardPerformance,
  getDashboardTrend,
} from '../controllers/dashboard.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  dashboardQuerySchema,
  dashboardPerformanceQuerySchema,
  dashboardTrendQuerySchema,
} from '../validations/dashboard.validation';

const router = Router();

router.use(authenticateToken);

router.get('/summary', validate(dashboardQuerySchema), getDashboardSummary);
router.get('/allocation', validate(dashboardQuerySchema), getDashboardAllocation);
router.get('/performance', validate(dashboardPerformanceQuerySchema), getDashboardPerformance);
router.get('/trend', validate(dashboardTrendQuerySchema), getDashboardTrend);

export default router;
