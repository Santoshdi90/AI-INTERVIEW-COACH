import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { interviewService } from '../services/interview.service';
import { feedbackRepository } from '../repositories/interview.repository';

export const interviewController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const interview = await interviewService.createInterview(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Interview created successfully',
        data: { interview },
      });
    } catch (err) { next(err); }
  },

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;
      const result = await interviewService.getInterviews(req.user!.id, page, limit, status);
      res.json({
        success: true,
        message: 'Interviews retrieved',
        data: result.interviews,
        meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
      });
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const interview = await interviewService.getInterviewById(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Interview retrieved', data: { interview } });
    } catch (err) { next(err); }
  },

  async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const interview = await interviewService.startInterview(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Interview started', data: { interview } });
    } catch (err) { next(err); }
  },

  async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await interviewService.submitAnswer({
        interviewId: req.params.id,
        questionId: req.body.questionId,
        userId: req.user!.id,
        transcript: req.body.transcript,
        duration: req.body.duration,
      });
      res.json({ success: true, message: 'Answer submitted and feedback generated', data: result });
    } catch (err) { next(err); }
  },

  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await interviewService.completeInterview(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Interview completed', data: result });
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await interviewService.deleteInterview(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Interview deleted' });
    } catch (err) { next(err); }
  },

  async getFeedback(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const interview = await interviewService.getInterviewById(req.params.id, req.user!.id);
      const feedbacks = await feedbackRepository.findByInterviewId(req.params.id);
      res.json({
        success: true,
        message: 'Feedback retrieved',
        data: { interview, feedbacks },
      });
    } catch (err) { next(err); }
  },
};
