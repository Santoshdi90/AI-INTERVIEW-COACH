import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { userService, analyticsService, adminService } from '../services/user.service';

export const userController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.id);
      res.json({ success: true, message: 'Profile retrieved', data: { user } });
    } catch (err) { next(err); }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.id, req.body);
      res.json({ success: true, message: 'Profile updated', data: { user } });
    } catch (err) { next(err); }
  },

  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }
      const user = await userService.uploadAvatar(req.user!.id, req.file);
      res.json({ success: true, message: 'Avatar updated', data: { user } });
    } catch (err) { next(err); }
  },

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
      res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
    } catch (err) { next(err); }
  },

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.deleteAccount(req.user!.id);
      res.json({ success: true, message: 'Account deleted successfully' });
    } catch (err) { next(err); }
  },

  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getDashboardStats(req.user!.id);
      res.json({ success: true, message: 'Dashboard data retrieved', data: stats });
    } catch (err) { next(err); }
  },

  async getSkills(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const skills = await userService.getSkills(req.user!.id);
      res.json({ success: true, message: 'Skills retrieved', data: { skills } });
    } catch (err) { next(err); }
  },

  async addSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const skill = await userService.addSkill(req.user!.id, req.body.name, req.body.proficiency || 50);
      res.status(201).json({ success: true, message: 'Skill added', data: { skill } });
    } catch (err) { next(err); }
  },

  async deleteSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.deleteSkill(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Skill deleted' });
    } catch (err) { next(err); }
  },
};

export const analyticsController = {
  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getAnalytics(req.user!.id);
      res.json({ success: true, message: 'Analytics retrieved', data });
    } catch (err) { next(err); }
  },
};

export const adminController = {
  async getStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getStats();
      res.json({ success: true, message: 'Stats retrieved', data: stats });
    } catch (err) { next(err); }
  },

  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const data = await adminService.getUsers(page, limit, search);
      res.json({ success: true, message: 'Users retrieved', data });
    } catch (err) { next(err); }
  },

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await adminService.deleteUser(req.user!.id, req.params.id);
      res.json({ success: true, message: 'User deleted' });
    } catch (err) { next(err); }
  },
};
