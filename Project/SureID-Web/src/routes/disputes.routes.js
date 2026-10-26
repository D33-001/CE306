import { Router } from 'express';
import { db } from '../models/db.js';

export const disputesRouter = Router();

/**
 * POST /api/v1/disputes/file
 * File dispute against an escrow transaction
 */
disputesRouter.post('/file', (req, res) => {
  const { escrowId, claimantId, category, title, description, evidenceUrls } = req.body;
  if (!escrowId || !claimantId || !title || !description) {
    return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลข้อพิพาทและรายละเอียดให้ครบถ้วน' });
  }

  try {
    const dispute = db.fileDispute({
      escrowId,
      claimantId,
      category,
      title,
      description,
      evidenceUrls
    });
    res.json({
      success: true,
      message: 'ยื่นเรื่องข้อพิพาทสำเร็จแล้ว! สัญญาถูกอายัดชั่วคราวเพื่อให้คนกลางเข้าตรวจสอบหลักฐาน',
      data: dispute
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/disputes/escrow/:escrowId
 */
disputesRouter.get('/escrow/:escrowId', (req, res) => {
  const dispute = db.getDisputeByEscrow(req.params.escrowId);
  res.json({
    success: true,
    data: dispute
  });
});

/**
 * GET /api/v1/disputes/all
 * For Inspector / Admin arbitration panel
 */
disputesRouter.get('/all', (req, res) => {
  const all = db.getAllDisputes();
  res.json({
    success: true,
    data: all
  });
});

/**
 * PUT /api/v1/disputes/:id/resolve
 * Inspector / Admin resolution ruling
 */
disputesRouter.put('/:id/resolve', (req, res) => {
  const { arbitratedBy = 'user_inspector_01', resolution, notes } = req.body;
  if (!resolution || !['resolved_buyer_refund', 'resolved_seller_payout'].includes(resolution)) {
    return res.status(400).json({ success: false, error: 'ผลการตัดสินไม่ถูกต้อง (ต้องเป็น resolved_buyer_refund หรือ resolved_seller_payout)' });
  }

  try {
    const resolved = db.resolveDispute(req.params.id, arbitratedBy, resolution, notes);
    res.json({
      success: true,
      message: `ตัดสินข้อพิพาทเรียบร้อยแล้ว: ${resolution === 'resolved_buyer_refund' ? 'คืนเงินผู้ซื้อ 100%' : 'ปล่อยเงินให้ผู้ขาย'}`,
      data: resolved
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
