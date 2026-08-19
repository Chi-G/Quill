import { User, IUser } from "../models/user.model.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import crypto from "crypto";

export class AuthService {
  private static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  static async generateAccessAndRefreshTokens(
    userId: string,
    userAgent?: string,
    ip?: string
  ) {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new ApiError(401, "User account is inactive or not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    const hashedToken = this.hashToken(refreshToken);

    // Save refresh token document in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create({
      user: user._id,
      token: hashedToken,
      expiresAt,
      userAgent: userAgent || "unknown",
      ip: ip || "unknown",
    });

    return { accessToken, refreshToken };
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    bio?: string;
  }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ApiError(400, "User with this email already exists");
    }

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      bio: data.bio || "",
    });

    const sanitizedUser = await User.findById(user._id).select("-password");
    return sanitizedUser;
  }

  static async login(
    email: string,
    password: string,
    userAgent?: string,
    ip?: string
  ) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(400, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "User account is deactivated");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(400, "Invalid email or password");
    }

    const tokens = await this.generateAccessAndRefreshTokens(
      (user._id as any).toString(),
      userAgent,
      ip
    );

    const sanitizedUser = await User.findById(user._id).select("-password");
    return { user: sanitizedUser, ...tokens };
  }

  static async refreshTokens(
    incomingRefreshToken: string,
    userAgent?: string,
    ip?: string
  ) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token required");
    }

    const decoded = jwt.verify(
      incomingRefreshToken,
      env.REFRESH_TOKEN_SECRET
    ) as { _id: string };

    const hashedToken = this.hashToken(incomingRefreshToken);
    const tokenDoc = await RefreshToken.findOne({
      token: hashedToken,
      revoked: false,
    });

    if (!tokenDoc) {
      throw new ApiError(401, "Invalid or revoked refresh token");
    }

    // Revoke old token (rotation)
    tokenDoc.revoked = true;
    await tokenDoc.save();

    return await this.generateAccessAndRefreshTokens(decoded._id, userAgent, ip);
  }

  static async logout(incomingRefreshToken: string) {
    if (incomingRefreshToken) {
      const hashedToken = this.hashToken(incomingRefreshToken);
      await RefreshToken.updateOne({ token: hashedToken }, { revoked: true });
    }
  }

  static async logoutAllDevices(userId: string) {
    await RefreshToken.updateMany({ user: userId, revoked: false }, { revoked: true });
  }
}
