import { Router } from 'express';
import { recordController } from '../controllers/recordController';
import { authenticate } from '../middleware/auth';
import { validateRequest, createRecordSchema, updateRecordSchema } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', recordController.getRecords);
router.post('/', validateRequest(createRecordSchema), recordController.createRecord);
router.get('/:id', recordController.getRecordById);
router.put('/:id', validateRequest(updateRecordSchema), recordController.updateRecord);
router.delete('/:id', recordController.deleteRecord);

export default router;
