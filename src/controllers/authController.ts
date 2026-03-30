import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { authService } from '../services/authService';
import { getCurrentTimestamp } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body;

      const result = await authService.register(email, password, name, role);

      res.status(201).json({
        success: true,
        data: result,
        message: '注册成功',
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result,
        message: '登录成功',
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      await authService.logout(userId);

      res.json({
        success: true,
        message: '登出成功',
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const user = await authService.getCurrentUser(userId);

      res.json({
        success: true,
        data: user,
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshAccessToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new AppError('UNAUTHORIZED', '未提供 Refresh Token', 401);
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        data: result,
        message: 'Access Token 刷新成功',
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
