import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../database/prisma';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { generateInviteCode } from '../utils/helpers';

export class AuthService {
  async register(
    email: string,
    password: string,
    name: string,
    role: 'husband' | 'wife'
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('EMAIL_EXISTS', '该邮箱已被注册', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        coupleId: true,
        createdAt: true,
      },
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        ...user,
        coupleId: user.coupleId,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', '邮箱或密码错误', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('INVALID_CREDENTIALS', '邮箱或密码错误', 401);
    }

    const accessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      coupleId: user.coupleId,
    });

    const refreshToken = this.generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
      coupleId: user.coupleId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        coupleId: user.coupleId,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    // JWT 是无状态的，登出主要由客户端处理（删除 token）
    // 这里可以添加黑名单逻辑，如果需要立即使 token 失效
    return { success: true };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        coupleId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    return user;
  }

  private generateAccessToken(payload: {
    id: string;
    email: string;
    role: string;
    coupleId: string | null;
  }): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessTokenExpiresIn as any,
    });
  }

  private generateRefreshToken(payload: {
    id: string;
    email: string;
    role: string;
    coupleId: string | null;
  }): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshTokenExpiresIn as any,
    });
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
      }

      const newAccessToken = this.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        coupleId: user.coupleId,
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('REFRESH_TOKEN_EXPIRED', 'Refresh Token 已过期，请重新登录', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('INVALID_REFRESH_TOKEN', '无效的 Refresh Token', 401);
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
