import { Response } from "express";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user profile"));
});

export const updateMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, bio, avatar } = req.body;
  const user = await User.findById(req.user!._id);
  if (!user) throw new ApiError(404, "User not found");

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  const updatedUser = await User.findById(user._id).select("-password");

  return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

export const getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.params.id).select("-password").populate("avatar");
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, "User details fetched"));
});

export const updateUserRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.role = role;
  await user.save();

  const updatedUser = await User.findById(user._id).select("-password");
  return res.status(200).json(new ApiResponse(200, updatedUser, `User role updated to ${role}`));
});
