import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { resumeService } from '../services/resume.service';
import { AppError } from '../middleware/errorHandler';

export const resumeController = {
  async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('No file uploaded', 400);
      const result = await resumeService.uploadAndAnalyze(req.user!.id, req.file);
      res.status(201).json({
        success: true,
        message: 'Resume uploaded and analyzed successfully',
        data: result,
      });
    } catch (err) { next(err); }
  },

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const resumes = await resumeService.getResumes(req.user!.id);
      res.json({ success: true, message: 'Resumes retrieved', data: { resumes } });
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.getResumeById(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Resume retrieved', data: { resume } });
    } catch (err) { next(err); }
  },

  async setActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.setActiveResume(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Resume set as active', data: { resume } });
    } catch (err) { next(err); }
  },

  async reanalyze(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await resumeService.reanalyzeResume(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Resume reanalyzed', data: result });
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await resumeService.deleteResume(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Resume deleted' });
    } catch (err) { next(err); }
  },
};
