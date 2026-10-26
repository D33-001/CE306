/**
 * Enterprise LINE Notification Service
 * Supports LINE Messaging API (Push Messages & Flex Message Cards) and LINE Webhook formats.
 * Strictly ZERO EMOJIS constraint.
 */

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const LINE_API_ENDPOINT = 'https://api.line.me/v2/bot/message/push';

// Internal message delivery log for auditing and testing
const lineDeliveryLog = [];

export const LineService = {
  /**
   * Generates a structured Flex Message bubble for LINE Messaging API
   */
  createEscrowFlexCard({ escrowId, title, price, statusName, stepNumber, buyerName, sellerName }) {
    return {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'ESCROW GAME VAULT ALERT', weight: 'bold', color: '#1DB446', size: 'xs' },
          { type: 'text', text: `Escrow Contract: ${escrowId}`, weight: 'bold', size: 'md', margin: 'xs' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: title, weight: 'bold', size: 'sm', wrap: true },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: 'Price:', color: '#888888', size: 'sm', flex: 2 },
                  { type: 'text', text: `THB ${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, weight: 'bold', size: 'sm', flex: 5 }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: 'Phase:', color: '#888888', size: 'sm', flex: 2 },
                  { type: 'text', text: `Step ${stepNumber} / 5 (${statusName})`, color: '#2B6CB0', size: 'sm', flex: 5 }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: 'Parties:', color: '#888888', size: 'sm', flex: 2 },
                  { type: 'text', text: `${buyerName} <-> ${sellerName}`, size: 'sm', flex: 5 }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#1DB446',
            action: {
              type: 'uri',
              label: 'View Escrow Room',
              uri: `https://escrow-vault.io/escrow/${escrowId}`
            }
          }
        ]
      }
    };
  },

  /**
   * Generates a structured Flex Message for Price Offers
   */
  createOfferFlexCard({ offerId, listingTitle, originalPrice, offeredPrice, discountPercent, buyerName }) {
    return {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'NEW PRICE OFFER RECEIVED', weight: 'bold', color: '#DD6B20', size: 'xs' },
          { type: 'text', text: `Offer ID: ${offerId}`, weight: 'bold', size: 'md', margin: 'xs' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: listingTitle, weight: 'bold', size: 'sm', wrap: true },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: 'Original:', color: '#888888', size: 'sm', flex: 3 },
                  { type: 'text', text: `THB ${Number(originalPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, size: 'sm', flex: 4 }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: 'Offered:', color: '#888888', size: 'sm', flex: 3 },
                  { type: 'text', text: `THB ${Number(offeredPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })} (-${discountPercent}%)`, weight: 'bold', color: '#E53E3E', size: 'sm', flex: 4 }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: 'From Buyer:', color: '#888888', size: 'sm', flex: 3 },
                  { type: 'text', text: buyerName, size: 'sm', flex: 4 }
                ]
              }
            ]
          }
        ]
      }
    };
  },

  /**
   * Dispatches LINE Push Message to a user
   * @param {string} lineUserId - User's LINE UID (Uxxxxxxxx...)
   * @param {string|Object} messageContent - Plain text or Flex container
   */
  async sendPushMessage({ lineUserId = 'U_SAMPLE_LINE_USER_01', messageContent }) {
    if (!messageContent) {
      throw new Error('Message content is required for LINE notification');
    }

    const isFlex = typeof messageContent === 'object' && messageContent.type === 'bubble';
    const payload = {
      to: lineUserId,
      messages: [
        isFlex
          ? {
              type: 'flex',
              altText: '[Escrow Vault Alert] Transaction update',
              contents: messageContent
            }
          : {
              type: 'text',
              text: `[Escrow Vault]\n${messageContent}`
            }
      ]
    };

    let deliveryStatus = 'simulated_delivered';

    // If real LINE Channel Access Token is provided, make real HTTPS call
    if (LINE_CHANNEL_ACCESS_TOKEN) {
      try {
        const response = await fetch(LINE_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
          },
          body: JSON.stringify(payload)
        });
        deliveryStatus = response.ok ? 'sent_to_line_api' : `failed_line_api_${response.status}`;
      } catch (err) {
        deliveryStatus = `network_error_${err.message}`;
      }
    }

    const logEntry = {
      id: `line_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      recipient: lineUserId,
      type: isFlex ? 'flex_message' : 'text_message',
      payload,
      status: deliveryStatus,
      dispatched_at: new Date().toISOString()
    };

    lineDeliveryLog.push(logEntry);
    return logEntry;
  },

  /**
   * Retrieves delivery history for testing and verification
   */
  getDeliveryLog() {
    return lineDeliveryLog;
  }
};
