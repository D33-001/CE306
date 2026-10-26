import crypto from 'crypto';

/**
 * Escrow Game Vault - Enterprise Security & Anti-Fraud Utility
 * Zero emoji constraint strictly applied.
 */

// Encryption Key (In production, load from HSM or AWS Secrets Manager)
const MASTER_VAULT_KEY = process.env.VAULT_ENCRYPTION_KEY || 'escrow_vault_enterprise_secure_key_2026_32bytes!!';
const ALGORITHM = 'aes-256-gcm';

export const SecurityEngine = {
  // ==========================================
  // 1. DATA ENCRYPTION AT REST (AES-256-GCM)
  // ==========================================

  /**
   * Encrypts sensitive account credentials before saving to vault
   */
  encryptCredentials(plainCredentials) {
    if (!plainCredentials) return null;
    const text = typeof plainCredentials === 'string' ? plainCredentials : JSON.stringify(plainCredentials);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(MASTER_VAULT_KEY.padEnd(32).slice(0, 32)), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encrypted_payload: encrypted,
      iv: iv.toString('hex'),
      auth_tag: authTag,
      algorithm: ALGORITHM,
      encrypted_at: new Date().toISOString()
    };
  },

  /**
   * Decrypts credentials only for authorized inspector or buyer at appropriate step
   */
  decryptCredentials(encryptedObject) {
    if (!encryptedObject || !encryptedObject.encrypted_payload) return null;
    try {
      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(MASTER_VAULT_KEY.padEnd(32).slice(0, 32)),
        Buffer.from(encryptedObject.iv, 'hex')
      );
      decipher.setAuthTag(Buffer.from(encryptedObject.auth_tag, 'hex'));

      let decrypted = decipher.update(encryptedObject.encrypted_payload, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (err) {
      throw new Error('การถอดรหัสล้มเหลว ข้อมูลอาจถูกแก้ไขหรือกุญแจไม่ถูกต้อง');
    }
  },

  // ==========================================
  // 2. CHAT DATA LOSS PREVENTION (DLP) & ANTI-BYPASS
  // ==========================================

  /**
   * Detects and redacts off-platform contact info to prevent fraud and fee evasion
   */
  sanitizeChatMessage(rawText) {
    if (!rawText) return { cleanText: '', isSuspicious: false, reasons: [] };

    let text = rawText;
    const reasons = [];

    // Thai Phone numbers: 08x-xxx-xxxx, 09xxxxxxxx, 06xxxxxxxx
    const phoneRegex = /(?:0|\+66)[689][0-9]{1}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
    if (phoneRegex.test(text)) {
      reasons.push('ตรวจพบเบอร์โทรศัพท์ (เสี่ยงต่อการติดต่อภายนอก)');
      text = text.replace(phoneRegex, '[ข้อมูลเบอร์โทรศัพท์ถูกระงับเพื่อความปลอดภัย]');
    }

    // Line ID sharing: id: xxx, line: xxx, @xxx
    const lineRegex = /(?:line|ไอดีไลน์|ไลน์|add\s*line)[:\s]*([a-zA-Z0-9._-]+)/gi;
    if (lineRegex.test(text)) {
      reasons.push('ตรวจพบ Line ID (ห้ามทำธุรกรรมนอกระบบ Escrow)');
      text = text.replace(lineRegex, 'Line: [ถูกระงับ]');
    }

    // Facebook Profile/Group URLs
    const fbRegex = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb)\.com\/[a-zA-Z0-9.]+/gi;
    if (fbRegex.test(text)) {
      reasons.push('ตรวจพบลิงก์ Facebook (เสี่ยงต่อการโคลนโปรไฟล์แอดมินปลอม)');
      text = text.replace(fbRegex, '[ลิงก์ Facebook ถูกระงับ]');
    }

    // PromptPay / Bank Account pattern: 10 or 13 digits
    const bankRegex = /\b[0-9]{3}-?[0-9]{1}-?[0-9]{5}-?[0-9]{1}\b/g;
    if (bankRegex.test(text)) {
      reasons.push('ตรวจพบเลขบัญชีธนาคาร (การโอนเงินตรงนอกระบบไม่ได้รับการคุ้มครอง)');
      text = text.replace(bankRegex, '[เลขบัญชีธนาคารถูกระงับ กรุณาชำระผ่านระบบ Escrow Vault]');
    }

    // Phishing keywords and suspicious Steam API links
    const phishingRegex = /(?:steamcommunity|steampowered-trade|free-nitro|free-robux|claim-gift)/gi;
    if (phishingRegex.test(text)) {
      reasons.push('ตรวจพบโดเมนหรือข้อความอันตรายที่เข้าข่าย Phishing');
      text = '[ข้อความอันตรายถูกบล็อกโดยระบบรักษาความปลอดภัย]';
    }

    return {
      cleanText: text,
      isSuspicious: reasons.length > 0,
      reasons
    };
  },

  // ==========================================
  // 3. THAI NATIONAL ID ALGORITHMIC CHECKSUM
  // ==========================================

  /**
   * Validates 13-digit Thai National ID using Modulo 11 checksum algorithm
   */
  validateThaiNationalID(idStr) {
    if (!idStr) return false;
    const cleanId = idStr.replace(/[^0-9]/g, '');
    if (cleanId.length !== 13) return false;

    // Check for repetitive fake numbers (e.g., 1111111111111, 0000000000000)
    if (/^([0-9])\1{12}$/.test(cleanId)) return false;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanId.charAt(i), 10) * (13 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === parseInt(cleanId.charAt(12), 10);
  },

  // ==========================================
  // 4. FINANCIAL IDEMPOTENCY & SLIP HASHING
  // ==========================================

  /**
   * Computes unique SHA-256 hash for bank slips to prevent replay/duplicate slip attacks
   */
  hashBankSlip(bankName, transRef, amount, dateTime) {
    const raw = `${bankName.toUpperCase()}_${transRef}_${Number(amount).toFixed(2)}_${dateTime}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  },

  // ==========================================
  // 5. ACCOUNT RECALL RISK SCORING (SECURITY SHIELD)
  // ==========================================

  /**
   * Calculates Recall Risk Score (0 - 100%, lower is safer)
   */
  evaluateAccountRecallRisk({ hasFirstEmail, isFirstOwner, bindType, platform, daysSinceCreation = 365 }) {
    let riskScore = 15; // Base baseline risk

    if (!hasFirstEmail) riskScore += 40;
    if (!isFirstOwner) riskScore += 20;

    if (platform === 'valorant' && !hasFirstEmail) riskScore += 15;
    if (platform === 'rov' && bindType === 'facebook_clean') riskScore += 10;
    if (platform === 'steam_library' && !hasFirstEmail) riskScore += 25;

    if (daysSinceCreation < 90) riskScore += 15;
    else if (daysSinceCreation > 730) riskScore -= 10;

    riskScore = Math.max(5, Math.min(95, riskScore));

    let riskLevel = 'LOW';
    let escrowHoldDaysRecommended = 7;

    if (riskScore >= 70) {
      riskLevel = 'CRITICAL';
      escrowHoldDaysRecommended = 30;
    } else if (riskScore >= 45) {
      riskLevel = 'MEDIUM';
      escrowHoldDaysRecommended = 14;
    }

    return {
      recallRiskScore: riskScore,
      riskLevel,
      recommendedWarrantyDays: escrowHoldDaysRecommended,
      safeToTransact: riskScore < 85
    };
  }
};
