import crypto from 'crypto';
import { db } from '../models/db.js';

/**
 * Enterprise Outbound Webhook Service
 * Dispatches cryptographically signed payloads (HMAC-SHA256) to external subscriber endpoints.
 * Strictly ZERO EMOJIS constraint.
 */

// Delivery log for auditing and debugging
const webhookDeliveryLog = [];

export const WebhookService = {
  /**
   * Dispatches an event payload to all matching registered webhook subscribers
   * @param {Object} params
   * @param {string} params.userId - Target user or platform admin
   * @param {string} params.eventType - e.g. 'escrow.initiated', 'offer.received', 'wallet.deposited'
   * @param {Object} params.data - The event payload
   */
  async dispatchEvent({ userId, eventType, data }) {
    // 1. Find active subscriptions for this user or global subscribers
    const subscriptions = db.getWebhookSubscriptions ? db.getWebhookSubscriptions(userId) : [];

    const matchedSubs = subscriptions.filter(sub => {
      if (!sub.is_active) return false;
      return sub.events.some(pattern => {
        if (pattern === '*' || pattern === eventType) return true;
        if (pattern.endsWith('.*')) {
          const prefix = pattern.slice(0, -2);
          return eventType.startsWith(prefix);
        }
        return false;
      });
    });

    const results = [];
    const payloadString = JSON.stringify({
      event: eventType,
      timestamp: new Date().toISOString(),
      user_id: userId,
      data
    });

    for (const sub of matchedSubs) {
      const deliveryId = `whd_${crypto.randomUUID().substring(0, 8)}`;
      const timestamp = Math.floor(Date.now() / 1000);

      // 2. Compute HMAC-SHA256 signature
      const signature = crypto
        .createHmac('sha256', sub.secret_key)
        .update(`${timestamp}.${payloadString}`)
        .digest('hex');

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'EscrowGameVault-Webhook/2.0',
        'X-Vault-Event': eventType,
        'X-Vault-Delivery': deliveryId,
        'X-Vault-Timestamp': String(timestamp),
        'X-Vault-Signature': `t=${timestamp},v1=${signature}`
      };

      let deliveryStatus = 'delivered';
      let statusCode = 200;

      // In real-world or live HTTP URL, attempt POST
      if (sub.target_url.startsWith('http')) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(sub.target_url, {
            method: 'POST',
            headers,
            body: payloadString,
            signal: controller.signal
          }).catch(err => ({ ok: false, status: 504, statusText: err.message }));
          clearTimeout(timeout);

          statusCode = res.status || 500;
          deliveryStatus = res.ok ? 'delivered' : 'failed';
        } catch (err) {
          deliveryStatus = 'network_error';
          statusCode = 500;
        }
      }

      const logEntry = {
        delivery_id: deliveryId,
        subscription_id: sub.subscription_id,
        target_url: sub.target_url,
        event: eventType,
        status: deliveryStatus,
        status_code: statusCode,
        signature: `t=${timestamp},v1=${signature}`,
        created_at: new Date().toISOString()
      };

      webhookDeliveryLog.push(logEntry);
      results.push(logEntry);
    }

    return results;
  },

  /**
   * Verifies an incoming webhook signature (Helper for consumers / testing)
   */
  verifySignature({ rawPayload, signatureHeader, secretKey, toleranceSeconds = 300 }) {
    if (!signatureHeader || !secretKey) return false;

    // Parse header: t=timestamp,v1=signature
    const parts = signatureHeader.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const sigPart = parts.find(p => p.startsWith('v1='));

    if (!timestampPart || !sigPart) return false;

    const timestamp = timestampPart.replace('t=', '');
    const signature = sigPart.replace('v1=', '');

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - Number(timestamp)) > toleranceSeconds) {
      return false; // Replay attack prevention
    }

    const expectedSig = crypto
      .createHmac('sha256', secretKey)
      .update(`${timestamp}.${rawPayload}`)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expectedSig, 'utf8'));
  },

  /**
   * Retrieves delivery log for auditing
   */
  getDeliveryLog() {
    return webhookDeliveryLog;
  }
};
