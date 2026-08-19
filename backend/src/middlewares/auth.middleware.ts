import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/user.model.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const verifyJWT = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "Unauthorized request: missing access token");
      }

      const secret =
        process.env.ACCESS_TOKEN_SECRET || "default_access_secret_32_characters";

      const decodedToken = jwt.verify(token, secret) as { _id: string };

      const user = await User.findById(decodedToken._id).select(
        "-password -refreshToken"
      );

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }

      req.user = user;
      next();
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  }
);
