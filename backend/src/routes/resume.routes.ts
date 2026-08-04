import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadResume } from '../utils/upload.utils';

const router = Router();
router.use(authenticate);

router.post('/', uploadResume.single('resume'), resumeController.upload);
router.get('/', resumeController.getAll);
router.get('/:id', resumeController.getById);
router.patch('/:id/set-active', resumeController.setActive);
router.post('/:id/reanalyze', resumeController.reanalyze);
router.delete('/:id', resumeController.delete);

export default router;
