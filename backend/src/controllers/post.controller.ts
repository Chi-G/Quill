import { Response } from "express";
import { PostService } from "../services/post.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const createPost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const post = await PostService.createPost((req.user!._id as any).toString(), req.body);
  return res.status(201).json(new ApiResponse(201, post, "Post created as draft"));
});

export const getPosts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await PostService.getPosts({
    ...req.query,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
    userRole: req.user?.role,
  });

  return res.status(200).json(new ApiResponse(200, result, "Posts retrieved successfully"));
});

export const getPostBySlug = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const post = await PostService.getPostBySlug(req.params.slug as string);
  return res.status(200).json(new ApiResponse(200, post, "Post fetched successfully"));
});

export const submitForReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const post = await PostService.submitForReview(req.params.id as string, (req.user!._id as any).toString());
  return res.status(200).json(new ApiResponse(200, post, "Post submitted for review"));
});

export const approvePost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const post = await PostService.approvePost(req.params.id as string, (req.user!._id as any).toString());
  return res.status(200).json(new ApiResponse(200, post, "Post published successfully"));
});

export const rejectPost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const post = await PostService.rejectPost(
    req.params.id as string,
    (req.user!._id as any).toString(),
    req.body.reason
  );
  return res.status(200).json(new ApiResponse(200, post, "Post rejected and returned to draft"));
});

export const updatePost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const post = await PostService.updatePost(req.params.id as string, req.body);
  return res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
});

export const deletePost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await PostService.deletePost(req.params.id as string);
  return res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully"));
});
