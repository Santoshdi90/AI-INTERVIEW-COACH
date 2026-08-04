import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { Prisma } from '@prisma/client';
import { resumeRepository } from '../repositories/resume.repository';
import { skillRepository } from '../repositories/analytics.repository';
import { storageService } from './storage.service';
import { aiService } from './ai.service';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

const TEMP_DIR = path.join(process.cwd(), 'uploads', 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

export const resumeService = {
  async uploadAndAnalyze(userId: string, file: Express.Multer.File) {
    logger.info(`Processing resume upload for userId: ${userId}`);

    // Extract text from PDF
    let rawText = '';
    try {
      const dataBuffer = fs.readFileSync(file.path);
      const parsed = await pdfParse(dataBuffer);
      rawText = parsed.text;
    } catch (err) {
      logger.warn('PDF text extraction failed, using filename as fallback');
      rawText = file.originalname;
    }

    // Upload file to storage
    const uploadResult = await storageService.uploadFile(
      file.path,
      file.originalname,
      'resumes'
    );

    // Clean up temp file
    try { fs.unlinkSync(file.path); } catch { /* ignore */ }

    // AI analysis
    const analysis = await aiService.analyzeResume(rawText);

    // Deactivate old resumes
    const existing = await resumeRepository.findByUserId(userId);
    const wasActive = existing.some(r => r.isActive);

    // Save resume record
    const resume = await resumeRepository.create({
      user: { connect: { id: userId } },
      fileName: file.originalname,
      fileUrl: uploadResult.url,
      fileSize: file.size,
      rawText: rawText.substring(0, 10000),
      overallScore: analysis.overallScore,
      atsScore: analysis.atsScore,
      analysisJson: JSON.parse(JSON.stringify(analysis)) as any,
      isActive: !wasActive || existing.length === 0,
    });

    // Set as active if first resume
    if (existing.length === 0) {
      await resumeRepository.setActive(resume.id, userId);
    }

    // Save extracted skills
    await skillRepository.upsertMany(userId, analysis.skills, 'RESUME');

    logger.info(`Resume processed successfully for userId: ${userId}, score: ${analysis.overallScore}`);
    return { resume, analysis };
  },

  async getResumes(userId: string) {
    return resumeRepository.findByUserId(userId);
  },

  async getResumeById(id: string, userId: string) {
    const resume = await resumeRepository.findById(id);
    if (!resume) throw new AppError('Resume not found', 404);
    if (resume.userId !== userId) throw new AppError('Access denied', 403);
    return resume;
  },

  async setActiveResume(id: string, userId: string) {
    const resume = await resumeRepository.findById(id);
    if (!resume) throw new AppError('Resume not found', 404);
    if (resume.userId !== userId) throw new AppError('Access denied', 403);
    await resumeRepository.setActive(id, userId);
    return resumeRepository.findById(id);
  },

  async deleteResume(id: string, userId: string) {
    const resume = await resumeRepository.findById(id);
    if (!resume) throw new AppError('Resume not found', 404);
    if (resume.userId !== userId) throw new AppError('Access denied', 403);
    await resumeRepository.delete(id);
  },

  async reanalyzeResume(id: string, userId: string) {
    const resume = await resumeRepository.findById(id);
    if (!resume) throw new AppError('Resume not found', 404);
    if (resume.userId !== userId) throw new AppError('Access denied', 403);

    const analysis = await aiService.analyzeResume(resume.rawText || resume.fileName);
    const updated = await resumeRepository.update(id, {
      overallScore: analysis.overallScore,
      atsScore: analysis.atsScore,
      analysisJson: JSON.parse(JSON.stringify(analysis)) as any,
    });

    await skillRepository.upsertMany(userId, analysis.skills, 'RESUME');
    return { resume: updated, analysis };
  },
};
