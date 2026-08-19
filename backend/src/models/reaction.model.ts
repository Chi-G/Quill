import mongoose, { Schema, Document, Model } from "mongoose";

export enum ReactionType {
  LIKE = "LIKE",
  DISLIKE = "DISLIKE",
}

export interface IReaction extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  type: ReactionType;
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ReactionType),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

reactionSchema.index({ user: 1, post: 1 }, { unique: true });

export const Reaction: Model<IReaction> = mongoose.model<IReaction>(
  "Reaction",
  reactionSchema
);
