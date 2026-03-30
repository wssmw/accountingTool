import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/refresh-access-token', authController.refreshAccessToken);

export default router;
