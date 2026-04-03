import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class StatisticsService {
  async getHomeOverview(userId: string, recentLimit: number = 10) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.coupleId) {
      throw new AppError('NOT_IN_COUPLE', '用户未加入家庭', 400);
    }

    const where: any = {
      coupleId: user.coupleId,
      deletedAt: null,
    };

    const [incomeResult, expenseResult, recentRecords] = await Promise.all([
      prisma.record.aggregate({
        where: { ...where, type: 'income' },
        _sum: { amount: true },
      }),
      prisma.record.aggregate({
        where: { ...where, type: 'expense' },
        _sum: { amount: true },
      }),
      prisma.record.findMany({
        where,
        take: recentLimit,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const totalIncome = Number(incomeResult._sum.amount) || 0;
    const totalExpense = Number(expenseResult._sum.amount) || 0;
    const balance = totalIncome - totalExpense;

    return {
      balance,
      totalIncome,
      totalExpense,
      recentRecords,
    };
  }

  async getSummary(userId: string, startDate?: string, endDate?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.coupleId) {
      throw new AppError('NOT_IN_COUPLE', '用户未加入家庭', 400);
    }

    const where: any = {
      coupleId: user.coupleId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const incomeResult = await prisma.record.aggregate({
      where: { ...where, type: 'income' },
      _sum: { amount: true },
    });

    const expenseResult = await prisma.record.aggregate({
      where: { ...where, type: 'expense' },
      _sum: { amount: true },
    });

    const totalIncome = Number(incomeResult._sum.amount) || 0;
    const totalExpense = Number(expenseResult._sum.amount) || 0;
    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
      startDate: startDate || null,
      endDate: endDate || null,
    };
  }

  async getByCategory(userId: string, startDate?: string, endDate?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.coupleId) {
      throw new AppError('NOT_IN_COUPLE', '用户未加入家庭', 400);
    }

    const where: any = {
      coupleId: user.coupleId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const expenseCategories = await prisma.record.groupBy({
      by: ['category'],
      where: { ...where, type: 'expense' },
      _sum: { amount: true },
      _count: true,
    });

    const incomeCategories = await prisma.record.groupBy({
      by: ['category'],
      where: { ...where, type: 'income' },
      _sum: { amount: true },
      _count: true,
    });

    return {
      expense: expenseCategories.map((cat) => ({
        category: cat.category,
        totalAmount: Number(cat._sum.amount) || 0,
        count: cat._count,
      })),
      income: incomeCategories.map((cat) => ({
        category: cat.category,
        totalAmount: Number(cat._sum.amount) || 0,
        count: cat._count,
      })),
    };
  }

  async getByPerson(userId: string, startDate?: string, endDate?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.coupleId) {
      throw new AppError('NOT_IN_COUPLE', '用户未加入家庭', 400);
    }

    const where: any = {
      coupleId: user.coupleId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const husbandData = await prisma.record.aggregate({
      where: { ...where, person: 'husband' },
      _sum: { amount: true },
      _count: true,
    });

    const wifeData = await prisma.record.aggregate({
      where: { ...where, person: 'wife' },
      _sum: { amount: true },
      _count: true,
    });

    return {
      husband: {
        totalIncome: Number(
          (
            await prisma.record.aggregate({
              where: { ...where, type: 'income', person: 'husband' },
              _sum: { amount: true },
            })
          )._sum.amount || 0
        ),
        totalExpense: Number(
          (
            await prisma.record.aggregate({
              where: { ...where, type: 'expense', person: 'husband' },
              _sum: { amount: true },
            })
          )._sum.amount || 0
        ),
        count: husbandData._count,
      },
      wife: {
        totalIncome: Number(
          (
            await prisma.record.aggregate({
              where: { ...where, type: 'income', person: 'wife' },
              _sum: { amount: true },
            })
          )._sum.amount || 0
        ),
        totalExpense: Number(
          (
            await prisma.record.aggregate({
              where: { ...where, type: 'expense', person: 'wife' },
              _sum: { amount: true },
            })
          )._sum.amount || 0
        ),
        count: wifeData._count,
      },
    };
  }

  async getByMonth(userId: string, year?: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.coupleId) {
      throw new AppError('NOT_IN_COUPLE', '用户未加入家庭', 400);
    }

    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear}-12-31`);

    const where: any = {
      coupleId: user.coupleId,
      deletedAt: null,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    const records = await prisma.record.findMany({
      where,
      select: {
        date: true,
        amount: true,
        type: true,
      },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    records.forEach((record) => {
      const month = new Date(record.date).getMonth();
      if (record.type === 'income') {
        monthlyData[month].income += Number(record.amount);
      } else {
        monthlyData[month].expense += Number(record.amount);
      }
    });

    return {
      year: currentYear,
      months: monthlyData,
    };
  }
}

export const statisticsService = new StatisticsService();
