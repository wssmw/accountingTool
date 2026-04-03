import { Request, Response, NextFunction } from 'express';
import { getCurrentTimestamp } from '../utils/helpers';
import logger from '../utils/logger';

export class AppError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      error: {
        code: err.code,
        message: err.message,
      },
      timestamp: getCurrentTimestamp(),
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
      timestamp: getCurrentTimestamp(),
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      error: {
        code: 'UNAUTHORIZED',
        message: '认证失败，请重新登录',
      },
      timestamp: getCurrentTimestamp(),
    });
  }

  return res.status(500).json({
    success: false,
    statusCode: 500,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    },
    timestamp: getCurrentTimestamp(),
  });
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: {
      code: 'NOT_FOUND',
      message: `路由 ${req.method} ${req.path} 不存在`,
    },
    timestamp: getCurrentTimestamp(),
  });
}