import { Router } from 'express';
import { SlipVerificationService } from '../services/slip.service.js';

export const slipRouter = Router();

/**
 * Bank Slip Verification Router (SlipOK / Bank Open API)
 * Anti-replay verification and automatic wallet crediting
 * Strictly ZERO EMOJIS constraint.
 */

/**
 * POST /api/v1/slips/verify-deposit
 * Submits bank transfer slip data for verification, anti-replay check, and automated wallet credit
 */
slipRouter.post('/verify-deposit', async (req, res) => {
  const { userId, slipData } = req.body;
  if (!userId || !slipData) {
    return res.status(400).json({
      success: false,
      error: 'กรุณาระบุ userId และข้อมูล slipData ให้ครบถ้วน'
    });
  }

  try {
    const result = await SlipVerificationService.verifyAndCreditDeposit({ userId, slipData });
    res.json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/v1/slips/check/:hash
 * Checks if a specific slip hash has already been redeemed
 */
slipRouter.get('/check/:hash', (req, res) => {
  const isUsed = SlipVerificationService.isSlipUsed(req.params.hash);
  res.json({
    success: true,
    slip_hash: req.params.hash,
    is_redeemed: isUsed
  });
});
