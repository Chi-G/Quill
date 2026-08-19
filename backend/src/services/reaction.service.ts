import { Reaction, ReactionType } from "../models/reaction.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";

export class ReactionService {
  static async toggleReaction(userId: string, postId: string, type: ReactionType) {
    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const existingReaction = await Reaction.findOne({ user: userId, post: postId });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if clicking same type (toggle off)
        await Reaction.findByIdAndDelete(existingReaction._id);
        return { message: "Reaction removed", type: null };
      } else {
        // Change vote type
        existingReaction.type = type;
        await existingReaction.save();
        return { message: "Reaction updated", type };
      }
    } else {
      await Reaction.create({ user: userId, post: postId, type });
      return { message: "Reaction added", type };
    }
  }

  static async getPostReactions(postId: string) {
    const likes = await Reaction.countDocuments({ post: postId, type: ReactionType.LIKE });
    const dislikes = await Reaction.countDocuments({ post: postId, type: ReactionType.DISLIKE });
    return { likes, dislikes };
  }
}
