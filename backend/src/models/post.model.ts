import mongoose, { Schema, Document, Model } from "mongoose";
import { PostStatus } from "../constants/postStatus.js";

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: mongoose.Types.ObjectId;
  status: PostStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  tags: mongoose.Types.ObjectId[];
  category?: mongoose.Types.ObjectId;
  coverImage?: mongoose.Types.ObjectId;
  viewCount: number;
  readingTime: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      trim: true,
      default: "",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(PostStatus),
      default: PostStatus.DRAFT,
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    coverImage: {
      type: Schema.Types.ObjectId,
      ref: "Media",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number,
      default: 1,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ title: "text", content: "text" });
postSchema.index({ status: 1, publishedAt: -1 });

export const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);
