import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  alertId?: mongoose.Types.ObjectId;
  title: string;
  body: string;
  read: boolean;
  created_at: Date;
  updated_at: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    alertId: {
      type: Schema.Types.ObjectId,
      ref: 'Alert',
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

NotificationSchema.index({ userId: 1, created_at: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
