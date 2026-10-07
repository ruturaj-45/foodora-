import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  role: 'customer' | 'restaurant' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
