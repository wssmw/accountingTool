import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { statisticsService } from '../services/statisticsService';
import { getCurrentTimestamp } from '../utils/helpers';

export class StatisticsController {
  async getHomeOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await statisticsService.getHomeOverview(userId, limit);

      res.status(200).json({
        success: true,
        statusCode: 200,
        data: result,
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { start_date, end_date } = req.query;

      const result = await statisticsService.getSummary(
        userId,
        start_date as string | undefined,
        end_date as string | undefined
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
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
      const { start_date, end_date, type } = req.query;

      const result = await statisticsService.getByCategory(
        userId,
        start_date as string | undefined,
        end_date as string | undefined
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
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
      const { start_date, end_date, type } = req.query;

      const result = await statisticsService.getByPerson(
        userId,
        start_date as string | undefined,
        end_date as string | undefined
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
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
      const { year, type } = req.query;

      const result = await statisticsService.getByMonth(
        userId,
        year ? parseInt(year as string) : undefined
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
        data: result,
        timestamp: getCurrentTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const statisticsController = new StatisticsController();