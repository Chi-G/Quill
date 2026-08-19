import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebhook extends Document {
  owner: mongoose.Types.ObjectId;
  url: string;
  event: string;
  secret: string;
  isActive: boolean;
  lastTriggeredAt?: Date;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const webhookSchema = new Schema<IWebhook>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    event: {
      type: String,
      required: true,
      trim: true,
    },
    secret: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTriggeredAt: {
      type: Date,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Webhook: Model<IWebhook> = mongoose.model<IWebhook>(
  "Webhook",
  webhookSchema
);
