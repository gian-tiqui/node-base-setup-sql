import { Request, Response } from "express";
import userService from "@/services/user.service";
import { AuthUtils } from "@/utils/auth";
import {
  RegisterDto,
  LoginDto,
  ApiResponse,
  AuthenticatedRequest,
  TokenPayload,
} from "@/types";
import { HTTP_STATUS } from "@/constants/constants";
import { createResponse } from "@/utils/response";
import { toMilliseconds } from "@/utils/timeConverter";
import { throwError } from "@/utils/error";

class AuthController {
  public register = async (
    req: Request<{}, {}, RegisterDto>,
    res: Response
  ): Promise<void> => {
    try {
      const { email, employeeId, phoneNumber } = req.body;

      // Check for existing users
      const [existingEmailUser, existingEmployeeUser, existingPhoneUser] =
        await Promise.all([
          userService.findByEmail(email),
          userService.findByEmployeeId(employeeId),
          userService.findByPhoneNumber(phoneNumber),
        ]);

      if (existingEmailUser || existingEmployeeUser || existingPhoneUser) {
        let message = "User already exists";

        if (existingEmployeeUser) {
          message = "User with this employee ID already exists";
        } else if (existingEmailUser) {
          message = "User with this email already exists";
        } else if (existingPhoneUser) {
          message = "User with this phone number already exists";
        }

        const response: ApiResponse = createResponse(false, message);
        res.status(HTTP_STATUS.CONFLICT).json(response);
        return;
      }

      // Create new user
      const user = await userService.create(req.body);

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      };

      const { accessToken, refreshToken } =
        AuthUtils.generateTokenPair(tokenPayload);

      // Save refresh token to user
      await userService.addRefreshToken(user.id, refreshToken);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: toMilliseconds(7, "day"),
      });

      const data = {
        user: userService.transformUser(user),
        accessToken,
      };

      const response: ApiResponse = createResponse(
        true,
        "User registered successfully",
        data
      );

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      throwError(
        "Registration failed",
        error,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        res
      );
    }
  };

  public login = async (
    req: Request<{}, {}, LoginDto>,
    res: Response
  ): Promise<void> => {
    try {
      const { employeeId, password } = req.body;

      const user = await userService.findByEmployeeId(employeeId);

      if (!user) {
        const response: ApiResponse = createResponse(
          false,
          "Invalid employee ID or password"
        );

        res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        const response: ApiResponse = createResponse(
          false,
          "Account is deactivated"
        );

        res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
        return;
      }

      const isPasswordValid = await userService.comparePassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        const response: ApiResponse = createResponse(
          false,
          "Invalid employee ID or password"
        );

        res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
        return;
      }

      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      };

      const { accessToken, refreshToken } =
        AuthUtils.generateTokenPair(tokenPayload);

      // Add refresh token to user
      await userService.addRefreshToken(user.id, refreshToken);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: toMilliseconds(7, "day"),
      });

      const data = {
        user: userService.transformUser(user),
        accessToken,
      };

      const response: ApiResponse = createResponse(
        true,
        "Login successful",
        data
      );

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      throwError("Login failed", error, HTTP_STATUS.INTERNAL_SERVER_ERROR, res);
    }
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        const response: ApiResponse = createResponse(
          false,
          "Refresh token required"
        );
        res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
        return;
      }

      try {
        const decoded = AuthUtils.verifyRefreshToken(refreshToken);

        const user = await userService.findById(decoded.userId);

        if (
          !user ||
          !user.refreshTokens.includes(refreshToken) ||
          !user.isActive
        ) {
          const response: ApiResponse = createResponse(
            false,
            "Invalid refresh token"
          );

          res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
          return;
        }

        const tokenPayload: TokenPayload = {
          userId: user.id,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
        };

        const { accessToken, refreshToken: newRefreshToken } =
          AuthUtils.generateTokenPair(tokenPayload);

        // Replace old refresh token with new one
        await userService.removeRefreshToken(user.id, refreshToken);
        await userService.addRefreshToken(user.id, newRefreshToken);

        // Set new refresh token as httpOnly cookie
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: toMilliseconds(7, "day"),
        });

        const data = {
          accessToken,
        };

        const response: ApiResponse = createResponse(
          true,
          "Token refreshed successfully",
          data
        );

        res.status(HTTP_STATUS.OK).json(response);
      } catch (jwtError) {
        const response: ApiResponse = createResponse(
          false,
          "Invalid or expired refresh token"
        );

        res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
        return;
      }
    } catch (error) {
      throwError(
        "Token refresh failed",
        error,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        res
      );
    }
  };

  public logout = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const userId = req.user?.userId;

      if (userId && refreshToken) {
        // Remove refresh token from user
        await userService.removeRefreshToken(userId, refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      const response: ApiResponse = createResponse(true, "Logout successful");

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      throwError(
        "Logout failed",
        error,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        res
      );
    }
  };

  public logoutAll = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (userId) {
        // Clear all refresh tokens
        await userService.clearAllRefreshTokens(userId);
      }

      res.clearCookie("refreshToken");

      const response: ApiResponse = createResponse(
        true,
        "Logged out from all devices successfully"
      );

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      throwError(
        "Logout failed",
        error,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        res
      );
    }
  };

  public getProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const user = await userService.findById(userId!);

      if (!user) {
        const response: ApiResponse = createResponse(false, "User not found");

        res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
        return;
      }

      const data = { user: userService.transformUser(user) };

      const response: ApiResponse = createResponse(
        true,
        "Profile retrieved successfully",
        data
      );

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      throwError(
        "Failed to retrieve profile",
        error,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        res
      );
    }
  };
}

export default new AuthController();
