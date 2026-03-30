import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from './errorHandler';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../config/constants';

export function validateRequest(schema: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const message = error.issues[0]?.message || '验证失败';
        next(new AppError('VALIDATION_ERROR', message, 400));
      } else {
        next(error);
      }
    }
  };
}

export const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少需要 6 个字符'),
  name: z.string().min(1, '昵称不能为空').max(50, '昵称最多 50 个字符'),
  role: z.enum(['husband', 'wife'] as const, {
    message: '角色必须是 husband 或 wife',
  }),
});

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
});

export const createRecordSchema = z.object({
  amount: z
    .number()
    .positive('金额必须大于 0')
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val.toString()),
      '金额最多 2 位小数'
    ),
  type: z.enum(['income', 'expense'] as any),
  category: z.string().refine(
    (val) => {
      if (EXPENSE_CATEGORIES.includes(val) || INCOME_CATEGORIES.includes(val)) {
        return true;
      }
      return false;
    },
    {
      message: '分类不在预定义列表中',
    }
  ),
  person: z.enum(['husband', 'wife'] as const, {
    message: '人员必须是 husband 或 wife',
  }),
  date: z
    .string()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
      },
      {
        message: '日期不能晚于当前日期',
      }
    ),
  note: z.string().max(500, '备注最多 500 个字符').optional(),
});

export const updateRecordSchema = z.object({
  amount: z
    .number()
    .positive('金额必须大于 0')
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val.toString()),
      '金额最多 2 位小数'
    )
    .optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z
    .string()
    .refine(
      (val) =>
        EXPENSE_CATEGORIES.includes(val) || INCOME_CATEGORIES.includes(val),
      '分类不在预定义列表中'
    )
    .optional(),
  person: z.enum(['husband', 'wife']).optional(),
  date: z
    .string()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
      },
      '日期不能晚于当前日期'
    )
    .optional(),
  note: z.string().max(500, '备注最多 500 个字符').optional(),
});

export const joinCoupleSchema = z.object({
  inviteCode: z.string().length(6, '邀请码必须是 6 位'),
});

export const createCoupleSchema = z.object({
  role: z.enum(['husband', 'wife'] as const, {
    message: '角色必须是 husband 或 wife',
  }),
});
