import crypto from 'crypto';

/**
 * Enterprise Secure Object Storage Service (Cloudflare R2 / AWS S3 Compatible)
 * Implements presigned URLs, time-limited access tokens, and HMAC-SHA256 signatures.
 * Protects sensitive KYC documents, transaction slips, and trade delivery screenshots.
 * Strictly ZERO EMOJIS constraint.
 */

const STORAGE_SECRET = process.env.STORAGE_SIGNING_SECRET || 'vault_r2_storage_secret_key_2026';
const PUBLIC_CDN_BASE = process.env.CDN_BASE_URL || 'https://storage.escrow-vault.io';

// In-memory mock storage registry for simulated uploads and metadata
const uploadedObjects = new Map();

export const StorageService = {
  /**
   * Generates a presigned upload URL for direct client-to-storage upload
   * @param {Object} params
   * @param {string} params.folder - 'kyc' | 'trades' | 'slips' | 'avatars'
   * @param {string} params.filename - Original filename
   * @param {string} params.contentType - MIME type (e.g. 'image/jpeg', 'image/png')
   * @param {number} [params.expiresInSeconds=900] - URL validity period (default: 15 mins)
   */
  generatePresignedUploadUrl({ folder = 'trades', filename, contentType, userId }) {
    if (!filename || !contentType) {
      throw new Error('Filename and contentType are required');
    }

    const allowedFolders = ['kyc', 'trades', 'slips', 'avatars'];
    if (!allowedFolders.includes(folder)) {
      throw new Error(`Invalid folder. Allowed: ${allowedFolders.join(', ')}`);
    }

    const ext = filename.split('.').pop() || 'bin';
    const uniqueId = crypto.randomUUID();
    const fileKey = `${folder}/${userId || 'system'}/${Date.now()}_${uniqueId}.${ext}`;
    const expiresAt = Math.floor(Date.now() / 1000) + 900; // 15 mins expiry

    // Generate HMAC signature for upload authorization
    const signaturePayload = `PUT\n${fileKey}\n${contentType}\n${expiresAt}`;
    const signature = crypto.createHmac('sha256', STORAGE_SECRET).update(signaturePayload).digest('hex');

    const uploadUrl = `${PUBLIC_CDN_BASE}/upload/${fileKey}?expires=${expiresAt}&sig=${signature}`;

    return {
      success: true,
      file_key: fileKey,
      upload_url: uploadUrl,
      method: 'PUT',
      headers: {
        'Content-Type': contentType
      },
      expires_at: new Date(expiresAt * 1000).toISOString()
    };
  },

  /**
   * Generates a time-limited presigned read URL with HMAC validation
   * @param {string} fileKey - S3/R2 object key
   * @param {number} [expiresInSeconds=3600] - Validity in seconds (default: 1 hour)
   */
  generatePresignedReadUrl(fileKey, expiresInSeconds = 3600) {
    if (!fileKey) {
      throw new Error('File key is required');
    }

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const signaturePayload = `GET\n${fileKey}\n${expiresAt}`;
    const signature = crypto.createHmac('sha256', STORAGE_SECRET).update(signaturePayload).digest('hex');

    const signedUrl = `${PUBLIC_CDN_BASE}/view/${fileKey}?expires=${expiresAt}&sig=${signature}`;

    return {
      file_key: fileKey,
      signed_url: signedUrl,
      expires_at: new Date(expiresAt * 1000).toISOString()
    };
  },

  /**
   * Validates a signed URL token
   */
  validateSignedUrl(fileKey, method, expiresAt, signature) {
    const now = Math.floor(Date.now() / 1000);
    if (now > Number(expiresAt)) {
      return { valid: false, error: 'Signed URL has expired' };
    }

    const signaturePayload = `${method.toUpperCase()}\n${fileKey}\n${expiresAt}`;
    const expectedSig = crypto.createHmac('sha256', STORAGE_SECRET).update(signaturePayload).digest('hex');

    if (expectedSig !== signature) {
      return { valid: false, error: 'Invalid HMAC signature' };
    }

    return { valid: true };
  },

  /**
   * Mock direct upload confirmation for local testing and demonstration
   */
  recordUploadedObject({ fileKey, sizeBytes, contentType, uploaderId }) {
    const metadata = {
      file_key: fileKey,
      size_bytes: sizeBytes || 102400,
      content_type: contentType || 'image/jpeg',
      uploader_id: uploaderId,
      uploaded_at: new Date().toISOString()
    };
    uploadedObjects.set(fileKey, metadata);
    return metadata;
  },

  /**
   * Gets metadata of an uploaded object
   */
  getObjectMetadata(fileKey) {
    return uploadedObjects.get(fileKey) || null;
  }
};
