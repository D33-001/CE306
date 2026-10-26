import { Router } from 'express';
import { db } from '../models/db.js';

export const walletRouter = Router();

/**
 * GET /api/v1/wallet/bank-accounts/:userId
 */
walletRouter.get('/bank-accounts/:userId', (req, res) => {
  const accounts = db.getBankAccounts(req.params.userId);
  res.json({
    success: true,
    data: accounts
  });
});

/**
 * POST /api/v1/wallet/bank-accounts
 */
walletRouter.post('/bank-accounts', (req, res) => {
  const { userId, bankName, accountNumber, accountHolderName } = req.body;
  if (!userId || !bankName || !accountNumber || !accountHolderName) {
    return res.status(400).json({ success: false, error: 'ข้อมูลบัญชีธนาคารไม่ครบถ้วน' });
  }

  try {
    const acc = db.addBankAccount({ userId, bankName, accountNumber, accountHolderName });
    res.json({
      success: true,
      message: 'ผูกบัญชีธนาคารรับเงินเรียบร้อยแล้ว',
      data: acc
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/wallet/withdraw
 * User submits withdrawal request to bank / PromptPay
 */
walletRouter.post('/withdraw', (req, res) => {
  const { userId, bankAccountId, amount } = req.body;
  try {
    const withdrawal = db.requestWithdrawal({ userId, bankAccountId, amount });
    const user = db.users.get(userId);
    res.json({
      success: true,
      message: `ส่งคำขอถอนเงิน ฿${Number(amount).toFixed(2)} สำเร็จ (หักค่าธรรมเนียมโอน ฿15.00 ยอดสุทธิ ฿${withdrawal.net_payout.toFixed(2)})`,
      data: {
        withdrawal,
        remaining_balance: user.wallet_balance
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/wallet/withdrawals
 * List withdrawals (filtered by userId or all for admin)
 */
walletRouter.get('/withdrawals', (req, res) => {
  const { userId } = req.query;
  const list = db.getWithdrawals(userId || null);
  res.json({
    success: true,
    data: list
  });
});

/**
 * PUT /api/v1/wallet/withdrawals/:id/approve
 * Admin approves payout and attaches transfer slip
 */
walletRouter.put('/withdrawals/:id/approve', (req, res) => {
  const { adminId = 'user_inspector_01', transferSlipUrl } = req.body;
  try {
    const approved = db.approveWithdrawal(req.params.id, adminId, transferSlipUrl);
    res.json({
      success: true,
      message: 'อนุมัติการโอนเงินและแนบสลิปสำเร็จแล้ว',
      data: approved
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/wallet/ledgers/:userId
 * Audit trail / Double-entry ledger
 */
walletRouter.get('/ledgers/:userId', (req, res) => {
  const ledgers = db.ledgers.filter(l => l.user_id === req.params.userId);
  res.json({
    success: true,
    data: ledgers.reverse()
  });
});
