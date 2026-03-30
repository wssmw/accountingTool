import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { statisticsService } from '../services/statisticsService';
import { getCurrentTimestamp } from '../utils/helpers';

export class StatisticsController {
  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { start_date, end_date } = req.query;

      const result = await statisticsService.getSummary(
        userId,
        start_date as string,
        end_date as string
      );

      res.json({
        success: true,
        data: result,
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getByCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { start_date, end_date } = req.query;

      const result = await statisticsService.getByCategory(
        userId,
        start_date as string,
        end_date as string
      );

      res.json({
        success: true,
        data: result,
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getByPerson(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { start_date, end_date } = req.query;

      const result = await statisticsService.getByPerson(
        userId,
        start_date as string,
        end_date as string
      );

      res.json({
        success: true,
        data: result,
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getByMonth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { year } = req.query;

      const result = await statisticsService.getByMonth(
        userId,
        year ? parseInt(year as string) : undefined
      );

      res.json({
        success: true,
        data: result,
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const statisticsController = new StatisticsController();
