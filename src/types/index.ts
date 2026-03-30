import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    coupleId: string | null;
  };
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  coupleId: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: number;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: number;
}
