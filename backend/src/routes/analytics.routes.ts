import { Router } from 'express';
import { analyticsController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', analyticsController.getAnalytics);

export default router;
