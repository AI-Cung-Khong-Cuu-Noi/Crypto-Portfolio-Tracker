import mongoose, { Document, Schema } from 'mongoose';

export interface IWatchlistItem extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  coinGeckoId?: string;
  created_at: Date;
  updated_at: Date;
}

const WatchlistItemSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

WatchlistItemSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const WatchlistItem = mongoose.model<IWatchlistItem>('WatchlistItem', WatchlistItemSchema);
