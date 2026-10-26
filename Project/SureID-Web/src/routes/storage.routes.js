import { Router } from 'express';
import { StorageService } from '../services/storage.service.js';

export const storageRouter = Router();

/**
 * Enterprise Object Storage Router (Cloudflare R2 / AWS S3)
 * Provides presigned URLs for client uploads and time-limited access tokens for private files.
 * Strictly ZERO EMOJIS constraint.
 */

/**
 * POST /api/v1/storage/presigned-upload
 * Requests a secure presigned upload URL for direct S3/R2 storage
 */
storageRouter.post('/presigned-upload', (req, res) => {
  const { folder, filename, contentType, userId } = req.body;
  try {
    const result = StorageService.generatePresignedUploadUrl({
      folder,
      filename,
      contentType,
      userId
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/storage/signed-url
 * Generates a time-limited presigned read URL to access private files (KYC, trade screenshots)
 */
storageRouter.get('/signed-url', (req, res) => {
  const { fileKey, expiresIn } = req.query;
  try {
    const seconds = expiresIn ? parseInt(expiresIn, 10) : 3600;
    const result = StorageService.generatePresignedReadUrl(fileKey, seconds);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/storage/confirm-upload
 * Records upload completion in the storage registry
 */
storageRouter.post('/confirm-upload', (req, res) => {
  const { fileKey, sizeBytes, contentType, uploaderId } = req.body;
  try {
    const meta = StorageService.recordUploadedObject({
      fileKey,
      sizeBytes,
      contentType,
      uploaderId
    });
    res.json({
      success: true,
      message: 'File upload confirmed and indexed',
      data: meta
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
