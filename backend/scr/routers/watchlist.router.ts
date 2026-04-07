import { Router } from 'express';
import { addWatchlistItem, getWatchlist, removeWatchlistItem } from '../controllers/watchlist.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createWatchlistItemSchema,
  watchlistItemIdParamSchema,
} from '../validations/watchlist.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validate(createWatchlistItemSchema), addWatchlistItem);
router.get('/', getWatchlist);
router.delete('/:id', validate(watchlistItemIdParamSchema), removeWatchlistItem);

export default router;
