import { Router } from 'express';
import { db } from '../models/db.js';
import { SecurityEngine } from '../utils/security.js';
import { NotificationService } from '../services/notification.service.js';

export const chatsRouter = Router();

/**
 * GET /api/v1/chats/my-threads
 * Retrieves all chat threads involving the current user (as buyer or seller)
 */
chatsRouter.get('/my-threads', (req, res) => {
  const { userId = 'user_buyer_01' } = req.query;
  try {
    const threads = db.getUserChatThreads(userId);
    res.json({
      success: true,
      total: threads.length,
      data: threads
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/chats/lobby
 * Retrieves messages in the Public Marketplace Trading Lobby (ห้องแชทรวมตลาดกลาง)
 */
chatsRouter.get('/lobby', (req, res) => {
  const msgs = db.getPublicLobbyMessages().map(m => {
    const linked = m.linked_listing_id ? db.listings.get(m.linked_listing_id) : null;
    return {
      ...m,
      linked_listing: linked ? {
        listing_id: linked.listing_id,
        title: linked.title,
        asking_price: linked.asking_price,
        game_type: linked.game_type,
        status: linked.status
      } : null
    };
  });
  res.json({
    success: true,
    total: msgs.length,
    data: msgs
  });
});

/**
 * POST /api/v1/chats/lobby
 * Sends a message to the Public Marketplace Trading Lobby with DLP filtering
 */
chatsRouter.post('/lobby', (req, res) => {
  const { senderId = 'user_buyer_01', text, tag = 'CHAT', linkedListingId = null } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Message text cannot be empty' });
  }
  try {
    const scanResult = SecurityEngine.sanitizeChatMessage(text);
    const msg = db.sendPublicLobbyMessage({
      senderId,
      text: scanResult.cleanText,
      tag,
      linkedListingId
    });
    res.json({
      success: true,
      security_filter: {
        was_sanitized: scanResult.isSuspicious,
        flags: scanResult.reasons
      },
      data: msg
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/chats/:threadId
 * Retrieves a single thread history with all messages and active offer
 */
chatsRouter.get('/:threadId', (req, res) => {
  const thread = db.getItemChatThread(req.params.threadId);
  if (!thread) {
    return res.status(404).json({ success: false, error: 'Chat thread not found' });
  }

  res.json({
    success: true,
    data: thread
  });
});

/**
 * POST /api/v1/chats/start
 * Starts or retrieves an existing chat thread for a buyer on a specific listing
 */
chatsRouter.post('/start', (req, res) => {
  const { listingId, buyerId = 'user_buyer_01' } = req.body;
  if (!listingId) {
    return res.status(400).json({ success: false, error: 'Listing ID is required' });
  }

  try {
    const thread = db.getOrCreateItemChatThread(listingId, buyerId);
    res.json({
      success: true,
      message: 'Chat thread opened successfully',
      data: thread
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/chats/:threadId/messages
 * Sends a standard message in the item chat thread with automated DLP Sanitization
 */
chatsRouter.post('/:threadId/messages', (req, res) => {
  const { senderId = 'user_buyer_01', text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Message text cannot be empty' });
  }

  try {
    // Automated Security & Anti-Fraud Chat Filtering (DLP)
    const scanResult = SecurityEngine.sanitizeChatMessage(text);
    const message = db.sendItemChatMessage(req.params.threadId, senderId, scanResult.cleanText);
    
    res.json({
      success: true,
      security_filter: {
        was_sanitized: scanResult.isSuspicious,
        flags: scanResult.reasons
      },
      data: message
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/chats/:threadId/offers
 * Buyer creates a price negotiation offer
 */
chatsRouter.post('/:threadId/offers', (req, res) => {
  const { buyerId = 'user_buyer_01', offeredPrice, message = '' } = req.body;
  if (!offeredPrice) {
    return res.status(400).json({ success: false, error: 'Offered price is required' });
  }

  try {
    const offer = db.createOffer({
      threadId: req.params.threadId,
      buyerId,
      offeredPrice,
      message
    });

    // Notify seller asynchronously via Omnichannel Notification
    const thread = db.itemChats.get(req.params.threadId);
    const listing = thread ? db.listings.get(thread.listing_id) : null;
    const buyer = db.users.get(buyerId);
    if (thread && listing) {
      NotificationService.notifyOfferReceived({
        offer,
        thread,
        listing,
        buyerName: buyer?.display_name || 'Buyer'
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: `Price offer of ฿${offer.offered_price.toFixed(2)} submitted to seller`,
      data: offer
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/v1/chats/:threadId/offers/:offerId
 * Seller responds to an offer (accept, decline, or counter)
 */
chatsRouter.put('/:threadId/offers/:offerId', (req, res) => {
  const { userId = 'user_seller_01', action, counterPrice = null } = req.body;
  if (!action || !['accept', 'decline', 'counter'].includes(action)) {
    return res.status(400).json({ success: false, error: 'Action must be accept, decline, or counter' });
  }

  try {
    const offer = db.respondToOffer({
      offerId: req.params.offerId,
      userId,
      action,
      counterPrice
    });

    // Notify buyer asynchronously via Omnichannel Notification
    const thread = db.itemChats.get(req.params.threadId);
    const listing = thread ? db.listings.get(offer.listing_id) : null;
    if (thread && listing) {
      NotificationService.notifyOfferAction({
        offer,
        thread,
        listing,
        action
      }).catch(() => {});
    }

    let msg = '';
    if (action === 'accept') msg = `Offer of ฿${offer.offered_price.toFixed(2)} accepted! Ready for Escrow.`;
    else if (action === 'decline') msg = 'Offer declined.';
    else if (action === 'counter') msg = `Counter-offer of ฿${offer.offered_price.toFixed(2)} proposed to buyer.`;

    res.json({
      success: true,
      message: msg,
      data: offer
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/chats/:threadId/offers/:offerId/escrow
 * Bridges accepted offer directly into Escrow Contract at the negotiated price
 */
chatsRouter.post('/:threadId/offers/:offerId/escrow', (req, res) => {
  const { buyerId = 'user_buyer_01' } = req.body;
  try {
    const escrow = db.initiateEscrowWithNegotiatedPrice({
      offerId: req.params.offerId,
      buyerId
    });

    res.json({
      success: true,
      message: `Escrow Contract ${escrow.escrow_id} initiated at negotiated price ฿${escrow.total_amount.toFixed(2)}! Funds safely locked.`,
      data: escrow
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
