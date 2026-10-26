import { Router } from 'express';
import { db } from '../models/db.js';
import { SteamTradeVerificationService } from '../services/steam.service.js';
import { NotificationService } from '../services/notification.service.js';

export const escrowRouter = Router();

/**
 * GET /api/v1/escrow
 * Lists all active and past escrow contracts with buyer/seller metadata
 */
escrowRouter.get('/', (req, res) => {
  const all = Array.from(db.escrows.values()).map(escrow => {
    const logs = db.escrowLogs.get(escrow.escrow_id) || { events: [], messages: [] };
    const buyer = db.users.get(escrow.buyer_id);
    const seller = db.users.get(escrow.seller_id);
    const listing = db.listings.get(escrow.listing_id);
    return {
      ...escrow,
      listing_title: listing ? listing.title : escrow.listing_id,
      platform_id: listing ? listing.platform_id : 'custom',
      buyer_name: buyer ? buyer.display_name : 'Buyer',
      seller_name: seller ? seller.display_name : 'Seller',
      timeline: logs.events,
      messages: logs.messages
    };
  });
  res.json({
    success: true,
    total: all.length,
    data: all
  });
});

/**
 * POST /api/v1/escrow/initiate
 * STEP 1: Buyer locks funds into Escrow Vault
 */
escrowRouter.post('/initiate', (req, res) => {
  const { buyerId = 'user_buyer_01', listingId, customPrice } = req.body;
  try {
    const escrow = db.initiateEscrow(buyerId, listingId, customPrice);

    // Notify buyer and seller omnichannel
    NotificationService.notifyEscrowInitiated(escrow).catch(() => {});

    res.json({
      success: true,
      message: `Step 1: Funds locked in Escrow Vault (฿${escrow.total_amount.toFixed(2)})`,
      data: escrow
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/escrow/:id/status
 * Fetches real-time status and timeline
 */
escrowRouter.get('/:id/status', (req, res) => {
  const escrow = db.escrows.get(req.params.id);
  if (!escrow) {
    return res.status(404).json({ success: false, error: 'Escrow contract not found' });
  }

  const logs = db.escrowLogs.get(req.params.id) || { events: [], messages: [] };
  const buyer = db.users.get(escrow.buyer_id);
  const seller = db.users.get(escrow.seller_id);

  res.json({
    success: true,
    data: {
      ...escrow,
      buyer_name: buyer ? buyer.display_name : 'Buyer',
      seller_name: seller ? seller.display_name : 'Seller',
      timeline: logs.events,
      messages: logs.messages
    }
  });
});

/**
 * POST /api/v1/escrow/:id/credentials
 * STEP 2 (For Accounts/Libraries): Seller submits credentials to encrypted vault
 */
escrowRouter.post('/:id/credentials', (req, res) => {
  const { sellerId = 'user_seller_01', credentials } = req.body;
  try {
    const escrow = db.submitCredentials(req.params.id, sellerId, credentials || { username: 'gamer_pro_99', pass: 'SecuredPass#2026' });

    NotificationService.notifyDeliverySubmitted(escrow, 'encrypted_vault').catch(() => {});

    res.json({
      success: true,
      message: 'Step 2: Credentials safely encrypted with AES-256-GCM and stored in vault. Ready for Inspector rebind.',
      data: escrow
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/escrow/:id/credentials
 * Retrieves and decrypts credentials only for authorized inspector or buyer
 */
escrowRouter.get('/:id/credentials', (req, res) => {
  const { requesterId = 'user_inspector_01' } = req.query;
  try {
    const decrypted = db.getDecryptedCredentials(req.params.id, requesterId);
    res.json({
      success: true,
      message: 'Credentials decrypted successfully for authorized session',
      data: decrypted
    });
  } catch (err) {
    res.status(403).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/escrow/:id/delivery-proof
 * STEP 2 (For In-Game Items): Seller submits in-game trade delivery proof (screenshot/IGN)
 */
escrowRouter.post('/:id/delivery-proof', (req, res) => {
  const { sellerId = 'user_seller_01', tradeMethod, proofUrl, sellerCharacter, buyerCharacter } = req.body;
  try {
    const escrow = db.submitItemDeliveryProof(req.params.id, sellerId, {
      trade_method: tradeMethod,
      proof_url: proofUrl,
      seller_character: sellerCharacter,
      buyer_character: buyerCharacter
    });

    // Notify buyer
    NotificationService.notifyDeliverySubmitted(escrow, tradeMethod || 'in_game_trade').catch(() => {});

    res.json({
      success: true,
      message: 'Step 2: In-game trade delivery proof submitted. Ready for verification.',
      data: escrow
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/escrow/:id/verify-steam-trade
 * Direct Valve Steam Web API Verification for CS2, Dota 2, TF2 trade offers
 */
escrowRouter.post('/:id/verify-steam-trade', async (req, res) => {
  const { tradeOfferId, sellerSteamId, buyerSteamId, expectedItemName } = req.body;
  try {
    const escrow = db.escrows.get(req.params.id);
    if (!escrow) {
      return res.status(404).json({ success: false, error: 'Escrow contract not found' });
    }

    const verification = await SteamTradeVerificationService.verifyTradeOffer({
      tradeOfferId,
      sellerSteamId,
      buyerSteamId,
      expectedItemName
    });

    if (verification.is_accepted) {
      escrow.trade_verification = verification;
      escrow.status = 'awaiting_buyer_confirm';

      const log = db.escrowLogs.get(req.params.id);
      if (log) {
        log.events.push({
          event: 'steam_trade_verified',
          detail: `Valve Steam Web API confirmed trade offer #${tradeOfferId} as Accepted. State code: 3.`,
          timestamp: new Date().toISOString()
        });
      }

      // Notify buyer that trade was verified by Steam Web API
      NotificationService.notifyRebindVerified(escrow).catch(() => {});
    }

    res.json({
      success: true,
      message: verification.is_accepted
        ? 'Steam Trade Offer verified as ACCEPTED by Valve API. Handed over for buyer confirmation.'
        : `Steam Trade Offer is currently in state: ${verification.state_name}`,
      data: {
        escrow_id: escrow.escrow_id,
        status: escrow.status,
        steam_verification: verification
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/v1/escrow/:id/verify-rebind
 * STEP 3: Inspector verifies inventory / item trade proof
 */
escrowRouter.put('/:id/verify-rebind', (req, res) => {
  const { inspectorId = 'user_inspector_01' } = req.body;
  try {
    const escrow = db.verifyAndRebind(req.params.id, inspectorId);

    // Notify buyer that credentials/item have been verified
    NotificationService.notifyRebindVerified(escrow).catch(() => {});

    res.json({
      success: true,
      message: 'Step 3: Verification completed. Handed over to buyer for testing and confirmation.',
      data: escrow
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/v1/escrow/:id/confirm-receipt
 * STEP 4: Buyer tests login / checks in-game inventory and accepts delivery
 */
escrowRouter.put('/:id/confirm-receipt', (req, res) => {
  const { buyerId = 'user_buyer_01' } = req.body;
  try {
    const escrow = db.buyerConfirmReceipt(req.params.id, buyerId);

    // Notify seller that buyer confirmed
    NotificationService.notifyReceiptConfirmed(escrow).catch(() => {});

    res.json({
      success: true,
      message: 'Step 4: Buyer confirmed receipt. Ready to release payment.',
      data: escrow
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/escrow/:id/release
 * STEP 5: Final settlement & Commission deduction
 */
escrowRouter.post('/:id/release', (req, res) => {
  const { callerId = 'user_buyer_01' } = req.body;
  try {
    const escrow = db.releaseEscrowFunds(req.params.id, callerId);

    // Notify buyer and seller omnichannel
    NotificationService.notifyEscrowReleased(escrow).catch(() => {});

    res.json({
      success: true,
      message: `Step 5: Transaction closed! Transferred ฿${escrow.seller_net_income.toFixed(2)} to seller (Platform fee: ฿${escrow.commission_fee.toFixed(2)})`,
      data: escrow
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/escrow/:id/message
 * Sends a message in the secure escrow room
 */
escrowRouter.post('/:id/message', (req, res) => {
  const { sender, role, text } = req.body;
  const log = db.escrowLogs.get(req.params.id);
  if (!log) {
    return res.status(404).json({ success: false, error: 'Escrow room not found' });
  }

  const newMsg = {
    sender: sender || 'User',
    role: role || 'user',
    text: text || '',
    ts: new Date().toLocaleTimeString('en-US', { hour12: false })
  };

  log.messages.push(newMsg);
  res.json({ success: true, data: newMsg });
});

/**
 * POST /api/v1/escrow/:id/call-admin
 * Calls Admin / Certified Inspector to intervene in escrow dispute
 */
escrowRouter.post('/:id/call-admin', (req, res) => {
  const { callerId = 'user_buyer_01', reason = 'wrong_credentials', note = '' } = req.body;
  try {
    const escrow = db.callAdminIntervention(req.params.id, callerId, reason, note);
    res.json({
      success: true,
      message: 'เรียก Admin เข้ามาดูแลสำเร็จ ระบบระงับขั้นตอนชั่วคราวและแจ้ง Inspector เข้าห้องทันที',
      data: escrow
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/escrow/:id/resolve-dispute
 * Admin resolves dispute by either refunding buyer or releasing to seller
 */
escrowRouter.post('/:id/resolve-dispute', (req, res) => {
  const { adminId = 'user_inspector_01', decision = 'refund_buyer', note = '' } = req.body;
  try {
    const escrow = db.resolveEscrowDispute(req.params.id, adminId, decision, note);
    res.json({
      success: true,
      message: decision === 'refund_buyer' ? 'คืนเงินเต็มจำนวนเข้ากระเป๋าผู้ซื้อเรียบร้อย' : 'ปล่อยเงินสุทธิเข้ากระเป๋าผู้ขายเรียบร้อย',
      data: escrow
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
