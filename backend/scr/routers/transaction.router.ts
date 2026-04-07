import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParamSchema,
  listTransactionsQuerySchema,
} from '../validations/transaction.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validate(createTransactionSchema), createTransaction);
router.get('/', validate(listTransactionsQuerySchema), getTransactions);
router.put('/:id', validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', validate(transactionIdParamSchema), deleteTransaction);

export default router;
