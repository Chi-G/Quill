import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await AuthService.register(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;

  const result = await AuthService.login(email, password, userAgent, ip);

  return res
    .status(200)
    .cookie("refreshToken", result.refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: result.user, accessToken: result.accessToken },
        "Logged in successfully"
      )
    );
});

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    const result = await AuthService.refreshTokens(
      incomingRefreshToken,
      userAgent,
      ip
    );

    return res
      .status(200)
      .cookie("refreshToken", result.refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken: result.accessToken, refreshToken: result.refreshToken },
          "Tokens refreshed successfully"
        )
      );
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  await AuthService.logout(incomingRefreshToken);

  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const logoutAllDevices = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await AuthService.logoutAllDevices((req.user!._id as any).toString());

    return res
      .status(200)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, {}, "Logged out of all devices successfully"));
  }
);
