import mongoose, { Document, Schema } from 'mongoose';

export type AlertKind =
  | 'PRICE_ABOVE'
  | 'PRICE_BELOW'
  | 'CHANGE_24H_ABOVE'
  | 'CHANGE_24H_BELOW';

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  coinGeckoId?: string;
  kind: AlertKind;
  /** USD for price alerts; positive % magnitude for change alerts */
  threshold: number;
  isActive: boolean;
  cooldownMinutes: number;
  lastTriggeredAt?: Date;
  created_at: Date;
  updated_at: Date;
}

const AlertSchema: Schema = new Schema(
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
    kind: {
      type: String,
      enum: ['PRICE_ABOVE', 'PRICE_BELOW', 'CHANGE_24H_ABOVE', 'CHANGE_24H_BELOW'],
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    cooldownMinutes: {
      type: Number,
      default: 60,
      min: 1,
      max: 10080,
    },
    lastTriggeredAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

AlertSchema.index({ userId: 1, isActive: 1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
