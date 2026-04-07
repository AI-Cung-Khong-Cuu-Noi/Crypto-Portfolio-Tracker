import mongoose, { Document, Schema } from 'mongoose';

export type TransactionType = 'BUY' | 'SELL' | 'TRANSFER';
export type TransferDirection = 'IN' | 'OUT';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  portfolioId: mongoose.Types.ObjectId;
  type: TransactionType;
  transferDirection?: TransferDirection;
  symbol: string;
  coinGeckoId?: string;
  amount: number;
  price?: number;
  fee: number;
  totalValue?: number;
  exchange: string;
  date: Date;
  note: string;
  created_at: Date;
  updated_at: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    portfolioId: {
      type: Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['BUY', 'SELL', 'TRANSFER'],
      required: true,
    },
    transferDirection: {
      type: String,
      enum: ['IN', 'OUT'],
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    coinGeckoId: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 80,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      min: 0,
    },
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalValue: {
      type: Number,
      min: 0,
    },
    exchange: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

TransactionSchema.index({ portfolioId: 1, date: 1 });
TransactionSchema.index({ userId: 1, date: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
