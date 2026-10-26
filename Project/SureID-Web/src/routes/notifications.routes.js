import { Router } from 'express';
import { db } from '../models/db.js';
import { NotificationService } from '../services/notification.service.js';
import { LineService } from '../services/line.service.js';
import { EmailService } from '../services/email.service.js';
import { WebhookService } from '../services/webhook.service.js';

export const notificationsRouter = Router();

/**
 * Enterprise Omnichannel Notification & Webhook Router
 * Supports In-App Notifications, LINE Push/Flex Cards, Transactional Email, and Outbound Webhooks.
 * Strictly ZERO EMOJIS constraint.
 */

/**
 * GET /api/v1/notifications
 * Retrieves notifications for a user
 */
notificationsRouter.get('/', (req, res) => {
  const { userId = 'user_buyer_01', unreadOnly } = req.query;
  const isUnread = unreadOnly === 'true' || unreadOnly === '1';

  try {
    const list = db.getUserNotifications(userId, isUnread);
    const totalUnread = db.getUserNotifications(userId, true).length;

    res.json({
      success: true,
      user_id: userId,
      total_items: list.length,
      unread_count: totalUnread,
      data: list
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/v1/notifications/:id/read
 * Marks a single notification as read
 */
notificationsRouter.put('/:id/read', (req, res) => {
  try {
    const notif = db.markNotificationAsRead(req.params.id);
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notif
    });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/v1/notifications/read-all
 * Marks all notifications as read for a user
 */
notificationsRouter.put('/actions/read-all', (req, res) => {
  const { userId = 'user_buyer_01' } = req.body;
  try {
    const result = db.markAllNotificationsAsRead(userId);
    res.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
      updated_count: result.count
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/notifications/dispatch-test
 * Sends a test omnichannel notification across In-App, LINE, Email, and Webhook
 */
notificationsRouter.post('/dispatch-test', async (req, res) => {
  const {
    userId = 'user_buyer_01',
    eventType = 'test.alert',
    title = 'ระบบทดสอบการแจ้งเตือนหลายช่องทาง',
    message = 'ทดสอบระบบการแจ้งเตือน Omnichannel แจ้งเตือนทั้ง In-App, LINE, Email และ Webhook',
    channels = ['in_app', 'line', 'email', 'webhook'],
    data = {}
  } = req.body;

  try {
    const result = await NotificationService.dispatch({
      userId,
      eventType,
      title,
      message,
      channels,
      data
    });

    res.json({
      success: true,
      message: 'Omnichannel notification dispatched successfully',
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/notifications/webhooks/subscribe
 * Registers an outbound webhook target URL with HMAC-SHA256 signature key
 */
notificationsRouter.post('/webhooks/subscribe', (req, res) => {
  const { userId = 'user_seller_01', targetUrl, secretKey, events = ['*'] } = req.body;

  if (!targetUrl) {
    return res.status(400).json({ success: false, error: 'Target URL is required' });
  }

  try {
    const sub = db.addWebhookSubscription({ userId, targetUrl, secretKey, events });
    res.json({
      success: true,
      message: 'Webhook subscription created successfully',
      data: sub
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/notifications/webhooks
 * Lists webhook subscriptions for a user
 */
notificationsRouter.get('/webhooks', (req, res) => {
  const { userId = 'user_seller_01' } = req.query;
  const subs = db.getWebhookSubscriptions(userId);
  res.json({
    success: true,
    total: subs.length,
    data: subs
  });
});

/**
 * DELETE /api/v1/notifications/webhooks/:id
 * Removes a webhook subscription
 */
notificationsRouter.delete('/webhooks/:id', (req, res) => {
  const removed = db.deleteWebhookSubscription(req.params.id);
  res.json({
    success: true,
    deleted: removed,
    message: removed ? 'Webhook subscription removed' : 'Subscription not found'
  });
});

/**
 * GET /api/v1/notifications/audit/logs
 * Retrieves delivery logs across LINE, Email, and Webhooks for audit/testing
 */
notificationsRouter.get('/audit/logs', (req, res) => {
  res.json({
    success: true,
    line_logs: LineService.getDeliveryLog(),
    email_outbox: EmailService.getOutbox(),
    webhook_logs: WebhookService.getDeliveryLog()
  });
});
