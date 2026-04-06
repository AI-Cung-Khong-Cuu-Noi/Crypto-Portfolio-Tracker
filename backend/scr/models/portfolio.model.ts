import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

const PortfolioSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
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

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
