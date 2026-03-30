import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';

export interface RecordQueryParams {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  person?: 'husband' | 'wife';
}

export class RecordService {
  async createRecord(
    userId: string,
    data: {
      amount: number;
      type: 'income' | 'expense';
      category: string;
      person: 'husband' | 'wife';
      date: string;
      note?: string;
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.coupleId) {
      throw new AppError('NOT_IN_COUPLE', '用户未加入家庭', 400);
    }

    const record = await prisma.record.create({
      data: {
        coupleId: user.coupleId,
        userId,
        amount: data.amount,
        type: data.type,
        category: data.category,
        person: data.person,
        date: new Date(data.date),
        note: data.note || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return record;
  }

  async getRecords(userId: string, params: RecordQueryParams) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.coupleId) {
      throw new AppError('NOT_IN_COUPLE', '用户未加入家庭', 400);
    }

    const { page = 1, limit = 20, type, startDate, endDate, person } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      coupleId: user.coupleId,
      deletedAt: null,
    };

    if (type) {
      where.type = type;
    }

    if (person) {
      where.person = person;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
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
      prisma.record.count({ where }),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecordById(userId: string, recordId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.coupleId) {
      throw new AppError('NOT_IN_COUPLE', '用户未加入家庭', 400);
    }

    const record = await prisma.record.findFirst({
      where: {
        id: recordId,
        coupleId: user.coupleId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!record) {
      throw new AppError('RECORD_NOT_FOUND', '记录不存在', 404);
    }

    return record;
  }

  async updateRecord(
    userId: string,
    recordId: string,
    data: {
      amount?: number;
      type?: 'income' | 'expense';
      category?: string;
      person?: 'husband' | 'wife';
      date?: string;
      note?: string;
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.coupleId) {
      throw new AppError('NOT_IN_COUPLE', '用户未加入家庭', 400);
    }

    const existingRecord = await prisma.record.findFirst({
      where: {
        id: recordId,
        coupleId: user.coupleId,
        deletedAt: null,
      },
    });

    if (!existingRecord) {
      throw new AppError('RECORD_NOT_FOUND', '记录不存在', 404);
    }

    if (existingRecord.userId !== userId) {
      throw new AppError('FORBIDDEN', '只有记录创建人可以编辑该记录', 403);
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const record = await prisma.record.update({
      where: { id: recordId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return record;
  }

  async deleteRecord(userId: string, recordId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.coupleId) {
      throw new AppError('NOT_IN_COUPLE', '用户未加入家庭', 400);
    }

    const existingRecord = await prisma.record.findFirst({
      where: {
        id: recordId,
        coupleId: user.coupleId,
        deletedAt: null,
      },
    });

    if (!existingRecord) {
      throw new AppError('RECORD_NOT_FOUND', '记录不存在', 404);
    }

    if (existingRecord.userId !== userId) {
      throw new AppError('FORBIDDEN', '只有记录创建人可以删除该记录', 403);
    }

    await prisma.record.update({
      where: { id: recordId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}

export const recordService = new RecordService();
