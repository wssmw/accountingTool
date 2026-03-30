import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { generateInviteCode } from '../utils/helpers';

export class CoupleService {
  async createCouple(userId: string, role: 'husband' | 'wife') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (user.coupleId) {
      throw new AppError('ALREADY_IN_COUPLE', '用户已加入家庭', 400);
    }

    let inviteCode = generateInviteCode();
    let exists = true;

    while (exists) {
      const existing = await prisma.couple.findUnique({
        where: { inviteCode },
      });
      if (!existing) {
        exists = false;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    const couple = await prisma.couple.create({
      data: {
        inviteCode,
        users: {
          connect: { id: userId },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        coupleId: couple.id,
        role,
      },
    });

    return {
      id: couple.id,
      inviteCode: couple.inviteCode,
      users: couple.users,
      createdAt: couple.createdAt,
    };
  }

  async joinCouple(userId: string, inviteCode: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (user.coupleId) {
      throw new AppError('ALREADY_IN_COUPLE', '用户已加入家庭', 400);
    }

    const couple = await prisma.couple.findUnique({
      where: { inviteCode },
      include: {
        users: true,
      },
    });

    if (!couple) {
      throw new AppError('INVALID_INVITE_CODE', '邀请码无效', 404);
    }

    if (couple.users.length >= 2) {
      throw new AppError('COUPLE_FULL', '家庭已满员（最多 2 人）', 400);
    }

    const existingUser = couple.users.find((u) => u.role === user.role);
    if (existingUser) {
      throw new AppError(
        'ROLE_CONFLICT',
        `家庭中已有${user.role === 'husband' ? '丈夫' : '妻子'}`,
        400
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        coupleId: couple.id,
      },
    });

    const updatedCouple = await prisma.couple.findUnique({
      where: { id: couple.id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return {
      id: updatedCouple!.id,
      inviteCode: updatedCouple!.inviteCode,
      users: updatedCouple!.users,
      createdAt: updatedCouple!.createdAt,
    };
  }

  async getCoupleInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.coupleId) {
      throw new AppError('NOT_IN_COUPLE', '用户未加入家庭', 404);
    }

    const couple = await prisma.couple.findUnique({
      where: { id: user.coupleId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!couple) {
      throw new AppError('COUPLE_NOT_FOUND', '家庭不存在', 404);
    }

    return {
      id: couple.id,
      inviteCode: couple.inviteCode,
      users: couple.users,
      createdAt: couple.createdAt,
    };
  }
}

export const coupleService = new CoupleService();
