import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedia extends Document {
  url: string;
  publicId: string;
  type: string;
  uploadedBy: mongoose.Types.ObjectId;
  size: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<IMedia>(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "image",
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: "image/jpeg",
    },
  },
  {
    timestamps: true,
  }
);

export const Media: Model<IMedia> = mongoose.model<IMedia>("Media", mediaSchema);
