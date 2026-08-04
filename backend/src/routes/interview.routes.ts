import { Router } from 'express';
import { body } from 'express-validator';
import { interviewController } from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
router.use(authenticate);

router.post('/',
  [
    body('type').isIn(['HR','TECHNICAL','BEHAVIORAL','SYSTEM_DESIGN','FRONTEND','BACKEND',
      'JAVA','JAVASCRIPT','REACT','NODE','DATABASE','OS','COMPUTER_NETWORKS','DBMS','OOPS','CUSTOM'])
      .withMessage('Invalid interview type'),
    body('difficulty').isIn(['EASY','MEDIUM','HARD']).withMessage('Invalid difficulty'),
    body('totalQuestions').isInt({ min: 1, max: 20 }).withMessage('Questions must be between 1-20'),
    body('customTopic').optional().isString(),
    body('title').optional().isString(),
  ],
  validate,
  interviewController.create
);

router.get('/', interviewController.getAll);
router.get('/:id', interviewController.getById);
router.post('/:id/start', interviewController.start);

router.post('/:id/answer',
  [
    body('questionId').notEmpty().withMessage('Question ID is required'),
    body('transcript').notEmpty().withMessage('Answer transcript is required'),
    body('duration').optional().isInt({ min: 0 }),
  ],
  validate,
  interviewController.submitAnswer
);

router.post('/:id/complete', interviewController.complete);
router.get('/:id/feedback', interviewController.getFeedback);
router.delete('/:id', interviewController.delete);

export default router;
