import { Router } from 'express';
import dotenv from 'dotenv';
import { db } from '../models/db.js';

dotenv.config();

export const authRouter = Router();

// Never send password hashes to the client
const publicUser = (u) => {
  if (!u) return u;
  const { password_hash, ...rest } = u;
  return { ...rest, has_password: !!password_hash };
};

// Current active session user (Default: Buyer)
let currentActiveUserId = 'user_buyer_01';

/**
 * GET /api/v1/auth/config
 * Public auth config for the frontend (Google OAuth Client ID)
 */
authRouter.get('/config', (req, res) => {
  const activeClientId = process.env.GOOGLE_CLIENT_ID || '';
  res.json({
    success: true,
    data: {
      googleClientId: activeClientId,
      googleEnabled: !!activeClientId
    }
  });
});

/**
 * POST /api/v1/auth/google-config
 * Updates the active Google Client ID at runtime
 */
authRouter.post('/google-config', (req, res) => {
  const { googleClientId } = req.body;
  if (!googleClientId || typeof googleClientId !== 'string') {
    return res.status(400).json({ success: false, error: 'กรุณาระบุ Google Client ID' });
  }
  process.env.GOOGLE_CLIENT_ID = googleClientId.trim();
  res.json({
    success: true,
    message: 'บันทึก Google Client ID เรียบร้อยแล้ว',
    data: { googleClientId: process.env.GOOGLE_CLIENT_ID, googleEnabled: true }
  });
});

/**
 * GET /api/v1/auth/me
 */
authRouter.get('/me', (req, res) => {
  const user = db.users.get(currentActiveUserId);
  res.json({
    success: true,
    data: publicUser(user)
  });
});

/**
 * POST /api/v1/auth/register
 * Body: { email, password, displayName }
 */
authRouter.post('/register', (req, res) => {
  const { email, password, displayName } = req.body;
  try {
    const newUser = db.registerUser({ email, password, displayName });
    currentActiveUserId = newUser.user_id;

    res.status(201).json({
      success: true,
      message: `ลงทะเบียนสำเร็จ! ยินดีต้อนรับคุณ ${newUser.display_name} (ได้รับเครดิตทดลอง ฿${newUser.wallet_balance.toFixed(2)})`,
      data: publicUser(newUser)
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 */
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.loginUser({ email, password });
    currentActiveUserId = user.user_id;

    res.json({
      success: true,
      message: `เข้าสู่ระบบสำเร็จ ยินดีต้อนรับคุณ ${user.display_name}`,
      data: publicUser(user)
    });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/auth/google
 * Body: { credential }  -- Google Identity Services ID token (JWT)
 * The token is verified with Google before any account is created or logged in.
 */
authRouter.post('/google', async (req, res) => {
  const { credential } = req.body;
  const activeClientId = process.env.GOOGLE_CLIENT_ID || '';
  if (!activeClientId) {
    return res.status(503).json({ success: false, error: 'ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID ในไฟล์ .env ของเซิร์ฟเวอร์' });
  }
  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ success: false, error: 'ไม่พบ Google credential' });
  }
  try {
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    const payload = await verifyRes.json();
    const validIssuer = payload.iss === 'accounts.google.com' || payload.iss === 'https://accounts.google.com';
    const notExpired = Number(payload.exp) * 1000 > Date.now();
    const emailVerified = payload.email_verified === true || payload.email_verified === 'true';

    if (!verifyRes.ok || payload.aud !== activeClientId || !validIssuer || !notExpired) {
      return res.status(401).json({ success: false, error: 'Google token ไม่ถูกต้องหรือหมดอายุ' });
    }
    if (!emailVerified) {
      return res.status(401).json({ success: false, error: 'อีเมล Google นี้ยังไม่ได้รับการยืนยัน' });
    }

    const user = db.googleAuthUser({
      email: payload.email,
      displayName: payload.name,
      photoUrl: payload.picture,
      googleSub: payload.sub
    });
    currentActiveUserId = user.user_id;

    res.json({
      success: true,
      message: `เข้าสู่ระบบด้วย Google สำเร็จ ยินดีต้อนรับคุณ ${user.display_name}`,
      data: publicUser(user)
    });
  } catch (err) {
    res.status(400).json({ success: false, error: 'ไม่สามารถยืนยันตัวตนกับ Google ได้: ' + err.message });
  }
});

/**
 * POST /api/v1/auth/google-direct
 * Registers or logs in using verified Google email format (@gmail.com / Google workspace)
 * Body: { email, displayName, photoUrl }
 */
authRouter.post('/google-direct', (req, res) => {
  const { email, displayName, photoUrl } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'กรุณาระบุอีเมล Google ของคุณ' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: 'รูปแบบอีเมลไม่ถูกต้อง กรุณาใช้อีเมลจริง' });
  }

  try {
    const user = db.googleAuthUser({
      email: cleanEmail,
      displayName: displayName ? displayName.trim() : cleanEmail.split('@')[0],
      photoUrl: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || cleanEmail)}&background=2b5cf6&color=fff&bold=true`
    });
    currentActiveUserId = user.user_id;

    res.json({
      success: true,
      message: `ลงทะเบียนและเข้าสู่ระบบด้วย Google (${cleanEmail}) สำเร็จ ยินดีต้อนรับคุณ ${user.display_name}`,
      data: publicUser(user)
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/auth/logout
 */
authRouter.post('/logout', (req, res) => {
  currentActiveUserId = 'user_buyer_01'; // Default back to guest / demo buyer
  res.json({
    success: true,
    message: 'ออกจากระบบเรียบร้อยแล้ว'
  });
});

/**
 * POST /api/v1/auth/switch-role
 * Body: { userId: "user_buyer_01" | "user_seller_01" | "user_inspector_01" | "user_owner_01" }
 */
authRouter.post('/switch-role', (req, res) => {
  const { userId } = req.body;
  if (!db.users.has(userId)) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  currentActiveUserId = userId;
  const user = db.users.get(userId);

  res.json({
    success: true,
    message: `Switched active perspective to: ${user.display_name} (${user.role.toUpperCase()})`,
    data: publicUser(user)
  });
});

/**
 * POST /api/v1/auth/topup
 */
authRouter.post('/topup', (req, res) => {
  const amount = Number(req.body.amount) || 5000.00;
  const targetUserId = req.body.userId || currentActiveUserId;
  const user = db.users.get(targetUserId) || db.users.get(currentActiveUserId);
  const method = (req.body.method || 'promptpay').toUpperCase();

  const before = user.wallet_balance;
  user.wallet_balance = +(user.wallet_balance + amount).toFixed(2);
  const entryId = `led_${Date.now()}`;
  db.ledgers.push({
    ledger_id: entryId,
    entry_id: entryId,
    user_id: user.user_id,
    escrow_id: null,
    entry_type: 'topup',
    type: `TOPUP_${method}`,
    debit_account: `${method}_GATEWAY`,
    credit_account: `WALLET:${user.user_id} (${user.display_name})`,
    description: `เติมเงินเข้ากระเป๋าผ่าน ${method}`,
    amount,
    balance_before: before,
    balance_after: user.wallet_balance,
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Topped up ฿${amount.toFixed(2)} successfully`,
    data: publicUser(user)
  });
});

/**
 * POST /api/v1/auth/withdraw
 */
authRouter.post('/withdraw', (req, res) => {
  const amount = Number(req.body.amount) || 0;
  const bankName = req.body.bankName || 'KBANK';
  const accountNo = req.body.accountNumber || req.body.accountNo || '089-2-44910-8';
  const targetUserId = req.body.userId || currentActiveUserId;
  const user = db.users.get(targetUserId) || db.users.get(currentActiveUserId);

  if (amount <= 0 || amount > user.wallet_balance) {
    return res.status(400).json({ success: false, error: 'ยอดเงินในกระเป๋าไม่เพียงพอสำหรับการถอน' });
  }

  const before = user.wallet_balance;
  user.wallet_balance = +(user.wallet_balance - amount).toFixed(2);
  const entryId = `led_${Date.now()}`;
  db.ledgers.push({
    ledger_id: entryId,
    entry_id: entryId,
    user_id: user.user_id,
    escrow_id: null,
    entry_type: 'withdrawal',
    type: 'BANK_WITHDRAWAL',
    channel: `${bankName} (${accountNo})`,
    debit_account: `WALLET:${user.user_id} (${user.display_name})`,
    credit_account: `${bankName} (${accountNo})`,
    description: `ถอนเงินเข้าบัญชีธนาคาร ${bankName} (${accountNo})`,
    amount: -amount,
    balance_before: before,
    balance_after: user.wallet_balance,
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `ส่งคำสั่งถอนเงิน ฿${amount.toFixed(2)} ไปยัง ${bankName} เรียบร้อยแล้ว`,
    data: publicUser(user)
  });
});

/**
 * GET /api/v1/auth/wallet-history
 */
authRouter.get('/wallet-history', (req, res) => {
  const scope = req.query.scope || 'user';
  const reqUserId = req.query.userId || currentActiveUserId;
  const user = db.users.get(reqUserId) || db.users.get(currentActiveUserId);

  const items = db.ledgers
    .filter(l => scope === 'all' || !user || l.user_id === user.user_id || user.role === 'owner' || user.role === 'inspector')
    .slice()
    .reverse()
    .map(l => {
      const u = db.users.get(l.user_id);
      const isOutflow = l.entry_type === 'withdrawal' || l.entry_type === 'escrow_lock' || Number(l.amount) < 0;
      const absAmt = Math.abs(Number(l.amount || 0));
      const signedAmt = isOutflow ? -absAmt : absAmt;
      const defaultDebit = l.entry_type === 'topup'
        ? 'PROMPTPAY_GATEWAY'
        : (l.entry_type === 'escrow_release' || l.entry_type === 'commission_revenue'
            ? `VAULT_ESCROW_LOCK:${l.escrow_id || 'CONTRACT'}`
            : `WALLET:${l.user_id} (${u ? u.display_name : l.user_id})`);
      const defaultCredit = l.entry_type === 'topup' || l.entry_type === 'escrow_release'
        ? `WALLET:${l.user_id} (${u ? u.display_name : l.user_id})`
        : (l.entry_type === 'escrow_lock'
            ? `VAULT_ESCROW_LOCK:${l.escrow_id || 'CONTRACT'}`
            : (l.channel || 'BANK_PAYOUT_ACCOUNT'));

      return {
        ...l,
        entry_id: l.entry_id || l.ledger_id,
        type: (l.type || l.entry_type || 'LEDGER').toUpperCase(),
        user_display_name: u ? u.display_name : l.user_id,
        debit_account: l.debit_account || defaultDebit,
        credit_account: l.credit_account || defaultCredit,
        signed_amount: signedAmt,
        is_outflow: isOutflow
      };
    });

  res.json({
    success: true,
    data: {
      history: items,
      items
    }
  });
});

/**
 * GET /api/v1/auth/analytics
 * Owner Dashboard analytics (GMV, Commission, Escrow counts)
 */
authRouter.get('/analytics', (req, res) => {
  const allEscrows = Array.from(db.escrows.values());
  const completedEscrows = allEscrows.filter(e => e.step_status === 'released_completed');
  
  const gmv = completedEscrows.reduce((sum, e) => sum + e.total_amount, 0);
  const totalCommission = completedEscrows.reduce((sum, e) => sum + e.commission_fee, 0);

  res.json({
    success: true,
    data: {
      totalGMV: gmv,
      platformRevenue: totalCommission,
      activeEscrowCount: allEscrows.filter(e => e.step_status !== 'released_completed').length,
      completedEscrowCount: completedEscrows.length,
      disputeRatePercent: 0.0,
      totalListings: db.listings.size,
      registeredUsers: db.users.size
    }
  });
});
