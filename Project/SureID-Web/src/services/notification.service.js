import { db } from '../models/db.js';
import { LineService } from './line.service.js';
import { EmailService } from './email.service.js';
import { WebhookService } from './webhook.service.js';

/**
 * Enterprise Omnichannel Notification Orchestrator
 * Integrates In-App Notifications, LINE Messaging (Push/Flex Cards), Transactional Email (HTML), and Outbound Webhooks.
 * Strictly ZERO EMOJIS constraint.
 */

export const NotificationService = {
  /**
   * Unified dispatcher across all configured channels
   */
  async dispatch({
    userId,
    eventType,
    title,
    message,
    data = {},
    channels = ['in_app', 'line', 'email', 'webhook']
  }) {
    const results = {
      user_id: userId,
      event_type: eventType,
      title,
      dispatched_channels: {},
      timestamp: new Date().toISOString()
    };

    const user = db.users.get(userId);

    // 1. In-App Notification (Always stored for user center)
    if (channels.includes('in_app')) {
      const inAppRecord = db.addNotification({
        userId,
        channel: 'in_app',
        eventType,
        title,
        message,
        metadata: data
      });
      results.dispatched_channels.in_app = {
        success: true,
        notification_id: inAppRecord.notification_id
      };
    }

    // 2. LINE Notification (Push / Flex Message)
    if (channels.includes('line')) {
      try {
        let lineContent = message;
        // If data contains escrow details, build rich Flex Card
        if (data.escrow_id && data.listing_title) {
          lineContent = LineService.createEscrowFlexCard({
            escrowId: data.escrow_id,
            title: data.listing_title,
            price: data.total_amount || 0,
            statusName: data.status || 'Active',
            stepNumber: data.step_number || 1,
            buyerName: data.buyer_name || 'Buyer',
            sellerName: data.seller_name || 'Seller'
          });
        } else if (data.offer_id) {
          lineContent = LineService.createOfferFlexCard({
            offerId: data.offer_id,
            listingTitle: data.listing_title || 'Listing Item',
            originalPrice: data.original_price || 0,
            offeredPrice: data.offered_price || 0,
            discountPercent: data.discount_percent || 0,
            buyerName: data.buyer_name || 'Buyer'
          });
        }

        const lineLog = await LineService.sendPushMessage({
          lineUserId: user?.line_user_id || `line_${userId}`,
          messageContent: lineContent
        });

        results.dispatched_channels.line = {
          success: true,
          delivery_id: lineLog.id,
          status: lineLog.status
        };
      } catch (err) {
        results.dispatched_channels.line = { success: false, error: err.message };
      }
    }

    // 3. Email Notification (Transactional Branded HTML)
    if (channels.includes('email') && user?.email) {
      try {
        let emailRes;
        if (data.escrow_id) {
          emailRes = await EmailService.sendEscrowUpdateEmail({
            to: user.email,
            recipientName: user.display_name,
            escrowId: data.escrow_id,
            listingTitle: data.listing_title || 'Escrow Item',
            phaseName: title,
            amount: data.total_amount || 0,
            statusMessage: message
          });
        } else if (data.trans_ref) {
          emailRes = await EmailService.sendDepositReceiptEmail({
            to: user.email,
            recipientName: user.display_name,
            amount: data.amount,
            newBalance: data.new_balance,
            transRef: data.trans_ref,
            sendingBank: data.sending_bank,
            slipHash: data.slip_hash
          });
        } else {
          // Generic transactional notification email
          emailRes = await EmailService._dispatchEmail({
            to: user.email,
            subject: `[Escrow Vault] ${title}`,
            text: message,
            html: EmailService._buildHtmlWrapper({
              title,
              recipientName: user.display_name,
              contentHtml: `<p>${message}</p>`,
              ctaText: 'เข้าสู่ระบบ Escrow Vault',
              ctaUrl: 'https://escrow-vault.io'
            })
          });
        }

        results.dispatched_channels.email = {
          success: true,
          email_id: emailRes.id,
          recipient: user.email
        };
      } catch (err) {
        results.dispatched_channels.email = { success: false, error: err.message };
      }
    }

    // 4. Outbound Webhook Dispatch (HMAC-SHA256 Signed)
    if (channels.includes('webhook')) {
      try {
        const webhookDeliveries = await WebhookService.dispatchEvent({
          userId,
          eventType,
          data: {
            title,
            message,
            ...data
          }
        });

        results.dispatched_channels.webhook = {
          success: true,
          deliveries_count: webhookDeliveries.length,
          deliveries: webhookDeliveries
        };
      } catch (err) {
        results.dispatched_channels.webhook = { success: false, error: err.message };
      }
    }

    return results;
  },

  // ==========================================
  // HIGH-LEVEL ESCROW WORKFLOW DISPATCHERS
  // ==========================================

  async notifyEscrowInitiated(escrow) {
    const listing = db.listings.get(escrow.listing_id);
    const buyer = db.users.get(escrow.buyer_id);
    const seller = db.users.get(escrow.seller_id);

    const payloadData = {
      escrow_id: escrow.escrow_id,
      listing_id: escrow.listing_id,
      listing_title: listing?.title || 'Gaming Asset',
      total_amount: escrow.total_amount,
      step_number: 1,
      status: escrow.status,
      buyer_name: buyer?.display_name || 'Buyer',
      seller_name: seller?.display_name || 'Seller'
    };

    // Notify Buyer: Funds safely locked
    await this.dispatch({
      userId: escrow.buyer_id,
      eventType: 'escrow.funds_locked',
      title: 'เงินของคุณถูกล็อกเข้าสู่ Escrow Vault เรียบร้อยแล้ว (Step 1/5)',
      message: `ระบบได้ล็อกเงินจำนวน ฿${escrow.total_amount.toFixed(2)} เข้าสู่ตู้เซฟกลางแล้ว กรุณารอผู้ขายส่งมอบข้อมูลไอดีหรือทำการเทรดไอเทม`,
      data: payloadData
    });

    // Notify Seller: New order ready to fulfill
    await this.dispatch({
      userId: escrow.seller_id,
      eventType: 'escrow.seller_action_required',
      title: 'ผู้ซื้อวางเงินมัดจำใน Escrow Vault แล้ว! กรุณาส่งมอบสินค้า (Step 2/5)',
      message: `ผู้ซื้อ ${buyer?.display_name} วางเงินจำนวน ฿${escrow.total_amount.toFixed(2)} ในตู้เซฟกลางแล้ว คุณสามารถส่งมอบข้อมูลไอดีผ่านระบบเซฟนิรภัย หรือส่งมอบไอเทมในเกมได้ทันที`,
      data: payloadData
    });
  },

  async notifyDeliverySubmitted(escrow, tradeMethod) {
    const listing = db.listings.get(escrow.listing_id);
    const payloadData = {
      escrow_id: escrow.escrow_id,
      listing_title: listing?.title || 'Gaming Asset',
      trade_method: tradeMethod,
      step_number: 2,
      status: escrow.status
    };

    await this.dispatch({
      userId: escrow.buyer_id,
      eventType: 'escrow.delivery_submitted',
      title: 'ผู้ขายได้ส่งมอบหลักฐาน/ข้อมูลไอดีแล้ว (Step 2/5)',
      message: 'ผู้ขายได้ส่งมอบข้อมูลไอดีเข้าสู่ตู้เซฟนิรภัย หรือส่งมอบไอเทมเรียบร้อยแล้ว กำลังรอการตรวจสอบความถูกต้อง',
      data: payloadData
    });
  },

  async notifyRebindVerified(escrow) {
    const listing = db.listings.get(escrow.listing_id);
    const payloadData = {
      escrow_id: escrow.escrow_id,
      listing_title: listing?.title || 'Gaming Asset',
      step_number: 3,
      status: escrow.status
    };

    await this.dispatch({
      userId: escrow.buyer_id,
      eventType: 'escrow.ready_for_confirmation',
      title: 'ผ่านการตรวจสอบความถูกต้องแล้ว! กรุณาตรวจสอบและกดยืนยัน (Step 4/5)',
      message: 'ผู้ตรวจสอบและระบบยืนยันความปลอดภัยของสินค้าแล้ว กรุณาเข้าสู่ห้องสัญญาเพื่อตรวจสอบไอดีหรือของในคลัง และกดยืนยันรับมอบสินค้า',
      data: payloadData
    });
  },

  async notifyReceiptConfirmed(escrow) {
    const listing = db.listings.get(escrow.listing_id);
    const buyer = db.users.get(escrow.buyer_id);
    const payloadData = {
      escrow_id: escrow.escrow_id,
      listing_title: listing?.title || 'Gaming Asset',
      step_number: 4,
      status: escrow.status
    };

    await this.dispatch({
      userId: escrow.seller_id,
      eventType: 'escrow.buyer_accepted',
      title: 'ผู้ซื้อตรวจสอบและกดยืนยันรับมอบสินค้าเรียบร้อยแล้ว (Step 4/5)',
      message: `ผู้ซื้อ ${buyer?.display_name} ยืนยันการรับมอบสินค้าสมบูรณ์ ระบบกำลังดำเนินการหักค่าธรรมเนียมและโอนเงินเข้า Wallet ของคุณ`,
      data: payloadData
    });
  },

  async notifyEscrowReleased(escrow) {
    const listing = db.listings.get(escrow.listing_id);
    const payloadData = {
      escrow_id: escrow.escrow_id,
      listing_title: listing?.title || 'Gaming Asset',
      seller_net_income: escrow.seller_net_income,
      commission_fee: escrow.commission_fee,
      step_number: 5,
      status: escrow.status
    };

    // Notify Seller: Funds transferred
    await this.dispatch({
      userId: escrow.seller_id,
      eventType: 'escrow.funds_released',
      title: 'ธุรกรรมสำเร็จ! โอนเงินเข้า Wallet ผู้ขายเรียบร้อยแล้ว (Step 5/5)',
      message: `ยอดเงินสุทธิ ฿${escrow.seller_net_income.toFixed(2)} (หักค่าธรรมเนียมแพลตฟอร์ม ฿${escrow.commission_fee.toFixed(2)}) ถูกโอนเข้า Wallet ของคุณแล้ว สามารถกดถอนเงินได้ทันที`,
      data: payloadData
    });

    // Notify Buyer: Escrow closed
    await this.dispatch({
      userId: escrow.buyer_id,
      eventType: 'escrow.closed',
      title: 'การซื้อขายเสร็จสมบูรณ์ ปิดสัญญา Escrow เรียบร้อยแล้ว (Step 5/5)',
      message: `การซื้อขาย ${listing?.title} สำเร็จอย่างปลอดภัย ระบบได้ปล่อยเงินให้ผู้ขายแล้ว ขอบคุณที่ใช้บริการ Escrow Game Vault`,
      data: payloadData
    });
  },

  // ==========================================
  // NEGOTIATION & OFFER DISPATCHERS
  // ==========================================

  async notifyOfferReceived({ offer, thread, listing, buyerName }) {
    await this.dispatch({
      userId: offer.seller_id,
      eventType: 'offer.received',
      title: 'มีข้อเสนอราคาใหม่ (ต่อรองราคา) เข้ามายังสินค้าของคุณ',
      message: `ผู้ซื้อ ${buyerName} ยื่นข้อเสนอราคา ฿${offer.offered_price.toFixed(2)} สำหรับสินค้า "${listing.title}" (ลดลง ${offer.discount_percent}%)`,
      data: {
        offer_id: offer.offer_id,
        thread_id: thread.thread_id,
        listing_id: listing.listing_id,
        listing_title: listing.title,
        original_price: offer.original_price,
        offered_price: offer.offered_price,
        discount_percent: offer.discount_percent,
        buyer_name: buyerName
      }
    });
  },

  async notifyOfferAction({ offer, thread, listing, action }) {
    const isAccepted = action === 'accept';
    await this.dispatch({
      userId: offer.buyer_id,
      eventType: isAccepted ? 'offer.accepted' : 'offer.declined',
      title: isAccepted ? 'ผู้ขายยอมรับข้อเสนอราคาของคุณแล้ว!' : 'ผู้ขายปฏิเสธข้อเสนอราคาของคุณ',
      message: isAccepted
        ? `ผู้ขายยอมรับราคา ฿${offer.offered_price.toFixed(2)} สำหรับสินค้า "${listing.title}" คุณสามารถกดเริ่มต้นสัญญา Escrow ที่ราคานี้ได้ทันที`
        : `ผู้ขายปฏิเสธราคา ฿${offer.offered_price.toFixed(2)} สำหรับสินค้า "${listing.title}" คุณสามารถเสนอราคาใหม่หรือติดต่อพูดคุยเพิ่มเติมในห้องแชท`,
      data: {
        offer_id: offer.offer_id,
        thread_id: thread.thread_id,
        listing_id: listing.listing_id,
        listing_title: listing.title,
        status: offer.status
      }
    });
  },

  // ==========================================
  // FINANCIAL WALLET DISPATCHERS
  // ==========================================

  async notifyDepositSuccess({ userId, amount, newBalance, transRef, sendingBank, slipHash }) {
    await this.dispatch({
      userId,
      eventType: 'wallet.deposited_slip',
      title: 'สลิปเงินโอนถูกต้อง เติมเงินเข้ากระเป๋า Wallet สำเร็จ',
      message: `ระบบตรวจสอบสลิปเงินโอน ${sendingBank} ยอดเงิน ฿${Number(amount).toFixed(2)} ถูกต้อง และได้เติมเงินเข้าสู่กระเป๋าของคุณแล้ว ยอดคงเหลือใหม่คือ ฿${Number(newBalance).toFixed(2)}`,
      data: {
        amount,
        new_balance: newBalance,
        trans_ref: transRef,
        sending_bank: sendingBank,
        slip_hash: slipHash
      }
    });
  }
};
