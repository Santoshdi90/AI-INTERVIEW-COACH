import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { uploadAvatar } from '../utils/upload.utils';

const router = Router();
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.get('/dashboard', userController.getDashboard);

router.patch('/profile',
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('phone').optional().isMobilePhone('any'),
    body('bio').optional().isLength({ max: 500 }),
  ],
  validate,
  userController.updateProfile
);

router.post('/avatar', uploadAvatar.single('avatar'), userController.uploadAvatar);

router.patch('/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must be at least 8 chars with uppercase, lowercase, and number'),
  ],
  validate,
  userController.changePassword
);

router.delete('/account', userController.deleteAccount);

router.get('/skills', userController.getSkills);
router.post('/skills',
  [
    body('name').trim().notEmpty().withMessage('Skill name is required'),
    body('proficiency').optional().isInt({ min: 0, max: 100 }),
  ],
  validate,
  userController.addSkill
);
router.delete('/skills/:id', userController.deleteSkill);

export default router;
