import { Comment, IComment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { eventBus, QuillEvent } from "../events/eventBus.js";

export class CommentService {
  static async addComment(
    postId: string,
    authorId: string,
    content: string,
    parentCommentId?: string
  ) {
    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent || parent.post.toString() !== postId) {
        throw new ApiError(400, "Invalid parent comment for this post");
      }
    }

    const comment = await Comment.create({
      post: postId,
      author: authorId,
      content,
      parentComment: parentCommentId || null,
    });

    const populated = await comment.populate("author", "name email avatar");
    eventBus.emit(QuillEvent.COMMENT_CREATED, populated);
    return populated;
  }

  static async getPostComments(postId: string) {
    const comments = await Comment.find({ post: postId, isDeleted: false })
      .populate("author", "name email avatar")
      .sort({ createdAt: 1 });

    return comments;
  }

  static async updateComment(commentId: string, authorId: string, content: string) {
    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      throw new ApiError(404, "Comment not found");
    }

    if (comment.author.toString() !== authorId) {
      throw new ApiError(403, "You can only edit your own comment");
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    return await comment.populate("author", "name email avatar");
  }

  static async softDeleteComment(commentId: string, authorId: string, isPrivileged = false) {
    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      throw new ApiError(404, "Comment not found");
    }

    if (comment.author.toString() !== authorId && !isPrivileged) {
      throw new ApiError(403, "You can only delete your own comment");
    }

    comment.isDeleted = true;
    comment.content = "[This comment has been deleted]";
    await comment.save();
  }
}
