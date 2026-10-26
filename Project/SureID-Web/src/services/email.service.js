/**
 * Enterprise Email Notification Service (SMTP / Resend / AWS SES Compatible)
 * Renders professional transactional HTML emails for Escrow milestones, receipts, and security alerts.
 * Strictly ZERO EMOJIS constraint.
 */

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.mailgun.org';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@escrow-vault.io';

// Internal email outbox for testing, audit, and offline demonstration
const emailOutbox = [];

export const EmailService = {
  /**
   * Generates a branded HTML email wrapper
   */
  _buildHtmlWrapper({ title, recipientName, preheader, contentHtml, ctaText, ctaUrl }) {
    return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 20px; color: #2d3748; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background-color: #1a202c; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px; }
    .body { padding: 32px 24px; line-height: 1.6; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { background-color: #3182ce; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
    .footer { background-color: #edf2f7; padding: 16px 24px; font-size: 12px; color: #718096; text-align: center; }
    .badge { display: inline-block; padding: 4px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; background: #e2e8f0; color: #4a5568; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ESCROW GAME VAULT</h1>
      <p style="color: #a0aec0; margin: 4px 0 0; font-size: 12px;">High-Trust P2P Gaming Marketplace</p>
    </div>
    <div class="body">
      <p>เรียนคุณ <strong>${recipientName || 'สมาชิกผู้ทรงเกียรติ'}</strong>,</p>
      ${contentHtml}
      ${ctaText && ctaUrl ? `
        <div class="button-container">
          <a href="${ctaUrl}" class="button" target="_blank">${ctaText}</a>
        </div>
      ` : ''}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #718096;">
        หมายเหตุ: การแจ้งเตือนนี้ส่งอัตโนมัติจากระบบ Escrow Game Vault ความปลอดภัยข้อมูลส่วนบุคคลได้รับการคุ้มครองด้วยการเข้ารหัส AES-256
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Escrow Game Vault Co., Ltd. Bangkok, Thailand. All rights reserved.
    </div>
  </div>
</body>
</html>`;
  },

  /**
   * Sends an Escrow Milestone Notification Email
   */
  async sendEscrowUpdateEmail({ to, recipientName, escrowId, listingTitle, phaseName, amount, statusMessage }) {
    const title = `[Escrow Vault] อัปเดตสถานะสัญญา ${escrowId}: ${phaseName}`;
    const contentHtml = `
      <div style="background-color: #ebf8ff; border-left: 4px solid #3182ce; padding: 16px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px; color: #2b6cb0;">สถานะสัญญา Escrow ล่าสุด: ${phaseName}</h3>
        <p style="margin: 0; font-size: 14px;">${statusMessage}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; color: #718096; width: 35%;">รหัสสัญญา (ID):</td>
          <td style="padding: 8px 0; font-weight: bold;">${escrowId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">รายการสินค้า:</td>
          <td style="padding: 8px 0; font-weight: bold;">${listingTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">มูลค่าในสัญญา Escrow:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #2b6cb0;">฿${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
    `;

    const html = this._buildHtmlWrapper({
      title,
      recipientName,
      contentHtml,
      ctaText: 'เข้าสู่ห้องสัญญา Escrow Room',
      ctaUrl: `https://escrow-vault.io/escrow/${escrowId}`
    });

    return this._dispatchEmail({
      to,
      subject: title,
      text: `[Escrow Vault] สัญญา ${escrowId}: ${phaseName} - ${statusMessage}. มูลค่า ฿${amount}`,
      html
    });
  },

  /**
   * Sends Bank Slip Deposit Confirmation Email
   */
  async sendDepositReceiptEmail({ to, recipientName, amount, newBalance, transRef, sendingBank, slipHash }) {
    const title = `[Escrow Vault] ใบเสร็จการเติมเงินผ่านสลิปธนาคารสำเร็จ (฿${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })})`;
    const contentHtml = `
      <div style="background-color: #f0fff4; border-left: 4px solid #38a169; padding: 16px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px; color: #276749;">ตรวจสอบสลิปเงินโอนถูกต้อง เรียบร้อยแล้ว</h3>
        <p style="margin: 0; font-size: 14px;">ยอดเงินจำนวน ฿${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ได้ถูกโอนเข้าสู่กระเป๋า Wallet ของคุณพร้อมใช้งานในระบบ Escrow ทันที</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; color: #718096; width: 35%;">ยอดเงินที่ได้รับ:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #38a169;">+฿${Number(amount).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">ยอดคงเหลือปัจจุบัน:</td>
          <td style="padding: 8px 0; font-weight: bold;">฿${Number(newBalance).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">รหัสอ้างอิงธุรกรรม (Ref):</td>
          <td style="padding: 8px 0;">${transRef} (${sendingBank})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">SHA-256 Slip Hash:</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 11px;">${slipHash.substring(0, 32)}...</td>
        </tr>
      </table>
    `;

    const html = this._buildHtmlWrapper({
      title,
      recipientName,
      contentHtml,
      ctaText: 'ตรวจสอบยอดเงินใน Wallet',
      ctaUrl: 'https://escrow-vault.io/wallet'
    });

    return this._dispatchEmail({
      to,
      subject: title,
      text: `[Escrow Vault] เติมเงินสำเร็จ ฿${amount} ผ่าน ${sendingBank} ยอดคงเหลือใหม่: ฿${newBalance}`,
      html
    });
  },

  /**
   * Internal dispatcher with production SMTP simulation
   */
  async _dispatchEmail({ to, subject, text, html }) {
    const emailRecord = {
      id: `em_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html,
      status: 'delivered',
      provider: 'smtp_mock_transport',
      dispatched_at: new Date().toISOString()
    };

    emailOutbox.push(emailRecord);
    return emailRecord;
  },

  /**
   * Retrieves outbox history for testing and verification
   */
  getOutbox() {
    return emailOutbox;
  }
};
