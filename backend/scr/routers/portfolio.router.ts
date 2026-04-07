import { Router } from 'express';
import {
  createPortfolio,
  getPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
} from '../controllers/portfolio.controller';
import { getHoldingsByPortfolio } from '../controllers/holdings.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createPortfolioSchema,
  updatePortfolioSchema,
  portfolioIdParamSchema,
} from '../validations/portfolio.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validate(createPortfolioSchema), createPortfolio);
router.get('/', getPortfolios);
router.get('/:id/holdings', validate(portfolioIdParamSchema), getHoldingsByPortfolio);
router.get('/:id', validate(portfolioIdParamSchema), getPortfolioById);
router.put('/:id', validate(updatePortfolioSchema), updatePortfolio);
router.delete('/:id', validate(portfolioIdParamSchema), deletePortfolio);

export default router;
