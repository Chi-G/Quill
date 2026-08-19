import { Response } from "express";
import { CommentService } from "../services/comment.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { UserRole } from "../constants/roles.js";

export const addComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const comment = await CommentService.addComment(
    req.params.id as string,
    (req.user!._id as any).toString(),
    req.body.content,
    req.body.parentComment
  );
  return res.status(201).json(new ApiResponse(201, comment, "Comment added successfully"));
});

export const getPostComments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const comments = await CommentService.getPostComments(req.params.id as string);
  return res.status(200).json(new ApiResponse(200, comments, "Comments retrieved successfully"));
});

export const updateComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const comment = await CommentService.updateComment(
    req.params.id as string,
    (req.user!._id as any).toString(),
    req.body.content
  );
  return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
});

export const deleteComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const isPrivileged = [UserRole.EDITOR, UserRole.ADMIN].includes(req.user!.role);
  await CommentService.softDeleteComment(
    req.params.id as string,
    (req.user!._id as any).toString(),
    isPrivileged
  );
  return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"));
});
