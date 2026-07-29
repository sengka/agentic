const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const senderName = process.env.EMAIL_SENDER_NAME || 'Agentic';
const senderEmail = process.env.EMAIL_SENDER_ADDRESS;

const sendViaBrevo = async ({ toEmail, subject, html }) => {
  try {
    await axios.post(
      BREVO_API_URL,
      {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );
    console.log(`Email gönderildi: ${toEmail}`);
  } catch (error) {
    const details = error.response?.data || error.message;
    console.error('Email gönderme hatası:', details);
  }
};

const sendReportEmail = async (toEmail, agentName, dailySummary) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #6366f1;">${agentName}</h2>
      <p style="color: #666;">Bugünkü günlük özetin hazır:</p>
      <div style="background: #f9fafb; padding: 16px; border-radius: 12px; margin-top: 12px;">
        <p style="white-space: pre-line; color: #333;">${dailySummary}</p>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">Bu email Agentic platformu tarafından otomatik gönderilmiştir.</p>
    </div>
  `;
  await sendViaBrevo({ toEmail, subject: `📋 ${agentName} - Günlük Özetin Hazır`, html });
};

const sendWeeklySummaryEmail = async (toEmail, summary, reportCount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #6366f1;">📰 Bu Haftanın Özeti</h2>
      <p style="color: #666;">${reportCount} rapor baz alınarak hazırlandı:</p>
      <div style="background: #f9fafb; padding: 16px; border-radius: 12px; margin-top: 12px;">
        <p style="white-space: pre-line; color: #333;">${summary}</p>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">Bu email Agentic platformu tarafından otomatik gönderilmiştir.</p>
    </div>
  `;
  await sendViaBrevo({ toEmail, subject: '📰 Haftalık Özetin Hazır', html });
};

module.exports = { sendReportEmail, sendWeeklySummaryEmail };