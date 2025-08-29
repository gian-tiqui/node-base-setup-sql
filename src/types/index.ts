import { Request } from "express";
import { User } from "@prisma/client";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface TokenPayload {
  userId: string;
  email: string;
  phoneNumber: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export interface RegisterDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  employeeId: string;
  email: string;
  password: string;
}

export interface LoginDto {
  employeeId: string;
  password: string;
}

export interface UserUpdateDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export type IUser = User;
