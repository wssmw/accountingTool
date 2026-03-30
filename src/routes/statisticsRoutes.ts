import { Router } from 'express';
import { statisticsController } from '../controllers/statisticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/summary', statisticsController.getSummary);
router.get('/by-category', statisticsController.getByCategory);
router.get('/by-person', statisticsController.getByPerson);
router.get('/by-month', statisticsController.getByMonth);

export default router;
