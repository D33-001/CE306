import { Router } from 'express';
import { db } from '../models/db.js';

export const kycRouter = Router();

/**
 * POST /api/v1/kyc/submit
 * User submits Thai National ID + Selfie verification
 */
kycRouter.post('/submit', (req, res) => {
  const { userId, fullNameTh, idCardNumber, idCardImageUrl, selfieImageUrl } = req.body;
  if (!userId || !fullNameTh || !idCardNumber) {
    return res.status(400).json({ success: false, error: 'กรุณากรอกชื่อ-นามสกุล และเลขบัตรประชาชน 13 หลักให้ครบถ้วน' });
  }

  try {
    const kyc = db.submitKYC({
      userId,
      fullNameTh,
      idCardNumber,
      idCardImageUrl,
      selfieImageUrl
    });
    res.json({
      success: true,
      message: 'ยื่นเอกสารยืนยันตัวตน (KYC) สำเร็จแล้ว อยู่ระหว่างการรอแอดมินอนุมัติ',
      data: kyc
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/kyc/status/:userId
 */
kycRouter.get('/status/:userId', (req, res) => {
  const kyc = db.getKYCByUser(req.params.userId);
  res.json({
    success: true,
    data: kyc
  });
});

/**
 * GET /api/v1/kyc/all
 * For Admin Inspector Dashboard
 */
kycRouter.get('/all', (req, res) => {
  const all = db.getAllKYC();
  res.json({
    success: true,
    data: all
  });
});

/**
 * PUT /api/v1/kyc/:id/review
 * Admin Inspector approves or rejects KYC
 */
kycRouter.put('/:id/review', (req, res) => {
  const { reviewerId = 'user_inspector_01', status, rejectionReason } = req.body;
  try {
    const reviewed = db.reviewKYC(req.params.id, reviewerId, status, rejectionReason);
    res.json({
      success: true,
      message: status === 'approved' ? 'อนุมัติการยืนยันตัวตน (KYC Approved) สำเร็จ' : 'ปฏิเสธเอกสาร KYC สำเร็จ',
      data: reviewed
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
