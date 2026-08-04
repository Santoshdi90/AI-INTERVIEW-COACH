import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadResult } from '../types';
import { logger } from '../config/logger';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const mockStorageService = {
  async uploadFile(
    filePath: string,
    originalName: string,
    folder = 'general'
  ): Promise<FileUploadResult> {
    logger.info(`[MockStorage] Uploading file: ${originalName} to ${folder}`);

    const ext = path.extname(originalName);
    const publicId = `${folder}/${uuidv4()}${ext}`;
    const destDir = path.join(UPLOADS_DIR, folder);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const destPath = path.join(destDir, `${uuidv4()}${ext}`);
    fs.copyFileSync(filePath, destPath);

    const stats = fs.statSync(destPath);
    const relPath = path.relative(UPLOADS_DIR, destPath);
    const url = `/uploads/${relPath.replace(/\\/g, '/')}`;

    logger.info(`[MockStorage] File saved at: ${destPath}`);

    return {
      url,
      publicId,
      format: ext.replace('.', ''),
      size: stats.size,
    };
  },

  async deleteFile(publicId: string): Promise<void> {
    logger.info(`[MockStorage] Deleting file: ${publicId}`);
    // In mock mode, we don't actually delete
  },

  async uploadAvatar(
    filePath: string,
    userId: string
  ): Promise<FileUploadResult> {
    return this.uploadFile(filePath, `avatar_${userId}.jpg`, 'avatars');
  },
};
