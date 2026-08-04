import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { feedbackRepository } from '../repositories/interview.repository';
import { AuthRequest } from '../types';
import { NextFunction, Response } from 'express';

const router = Router();
router.use(authenticate);

router.get('/interview/:interviewId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const feedbacks = await feedbackRepository.findByInterviewId(req.params.interviewId);
    res.json({ success: true, message: 'Feedback retrieved', data: { feedbacks } });
  } catch (err) { next(err); }
});

export default router;
