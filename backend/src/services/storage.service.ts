import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { FileUploadResult } from '../types';
import { logger } from '../config/logger';

// ─── Storage Provider Interface ─────────────────────────────
interface IStorageProvider {
  uploadFile(filePath: string, originalName: string, folder?: string): Promise<FileUploadResult>;
  deleteFile(publicId: string): Promise<void>;
  uploadAvatar(filePath: string, userId: string): Promise<FileUploadResult>;
}

// ─── Local Storage Provider ─────────────────────────────────
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const localStorageProvider: IStorageProvider = {
  async uploadFile(filePath: string, originalName: string, folder = 'general'): Promise<FileUploadResult> {
    logger.info(`[Storage:Local] Uploading file: ${originalName} to ${folder}`);

    const ext = path.extname(originalName);
    const publicId = `${folder}/${uuidv4()}${ext}`;
    const destDir = path.join(UPLOADS_DIR, folder);

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const fileName = `${uuidv4()}${ext}`;
    const destPath = path.join(destDir, fileName);
    fs.copyFileSync(filePath, destPath);

    const stats = fs.statSync(destPath);
    const relPath = path.relative(UPLOADS_DIR, destPath);
    const url = `/uploads/${relPath.replace(/\\/g, '/')}`;

    logger.info(`[Storage:Local] File saved at: ${destPath}`);
    return { url, publicId, format: ext.replace('.', ''), size: stats.size };
  },

  async deleteFile(publicId: string): Promise<void> {
    logger.info(`[Storage:Local] Deleting file: ${publicId}`);
    const filePath = path.join(UPLOADS_DIR, publicId);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (error) {
      logger.warn(`[Storage:Local] Failed to delete file: ${publicId}`, error);
    }
  },

  async uploadAvatar(filePath: string, userId: string): Promise<FileUploadResult> {
    return this.uploadFile(filePath, `avatar_${userId}.jpg`, 'avatars');
  },
};

// ─── Cloudinary Storage Provider ────────────────────────────
let cloudinaryConfigured = false;

function ensureCloudinaryConfig(): void {
  if (!cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    cloudinaryConfigured = true;
  }
}

const cloudinaryStorageProvider: IStorageProvider = {
  async uploadFile(filePath: string, originalName: string, folder = 'general'): Promise<FileUploadResult> {
    ensureCloudinaryConfig();
    logger.info(`[Storage:Cloudinary] Uploading file: ${originalName} to ${folder}`);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `ai-interview-coach/${folder}`,
      resource_type: 'auto',
      public_id: uuidv4(),
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  },

  async deleteFile(publicId: string): Promise<void> {
    ensureCloudinaryConfig();
    logger.info(`[Storage:Cloudinary] Deleting file: ${publicId}`);
    await cloudinary.uploader.destroy(publicId);
  },

  async uploadAvatar(filePath: string, userId: string): Promise<FileUploadResult> {
    ensureCloudinaryConfig();
    logger.info(`[Storage:Cloudinary] Uploading avatar for userId: ${userId}`);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'ai-interview-coach/avatars',
      resource_type: 'image',
      public_id: `avatar_${userId}`,
      overwrite: true,
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  },
};

// ─── S3 Storage Provider (Stub) ─────────────────────────────
// Requires @aws-sdk/client-s3 to be installed:
//   npm install @aws-sdk/client-s3
const s3StorageProvider: IStorageProvider = {
  async uploadFile(filePath: string, originalName: string, folder = 'general'): Promise<FileUploadResult> {
    // To implement: install @aws-sdk/client-s3 and configure
    // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    // const client = new S3Client({ region: env.AWS_S3_REGION });
    // const key = `${folder}/${uuidv4()}${path.extname(originalName)}`;
    // const fileStream = fs.createReadStream(filePath);
    // await client.send(new PutObjectCommand({
    //   Bucket: env.AWS_S3_BUCKET,
    //   Key: key,
    //   Body: fileStream,
    // }));
    // return {
    //   url: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_S3_REGION}.amazonaws.com/${key}`,
    //   publicId: key,
    //   format: path.extname(originalName).replace('.', ''),
    //   size: fs.statSync(filePath).size,
    // };

    logger.warn('[Storage:S3] S3 provider not fully configured. Install @aws-sdk/client-s3 and uncomment implementation.');
    // Fall back to local storage
    return localStorageProvider.uploadFile(filePath, originalName, folder);
  },

  async deleteFile(publicId: string): Promise<void> {
    logger.warn(`[Storage:S3] S3 delete not fully configured for: ${publicId}`);
  },

  async uploadAvatar(filePath: string, userId: string): Promise<FileUploadResult> {
    return this.uploadFile(filePath, `avatar_${userId}.jpg`, 'avatars');
  },
};

// ─── Storage Provider Factory ───────────────────────────────
function createStorageProvider(): IStorageProvider {
  const provider = env.STORAGE_PROVIDER;

  switch (provider) {
    case 'cloudinary':
      logger.info('[Storage] Using Cloudinary storage provider');
      return cloudinaryStorageProvider;

    case 's3':
      logger.info('[Storage] Using S3 storage provider');
      return s3StorageProvider;

    case 'local':
    default:
      logger.info('[Storage] Using local filesystem storage provider');
      return localStorageProvider;
  }
}

// ─── Exported Storage Service ───────────────────────────────
export const storageService: IStorageProvider = createStorageProvider();
