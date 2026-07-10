const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReportEmail = async (toEmail, agentName, dailySummary) => {
  try {
    await transporter.sendMail({
      from: `"Agentic" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `📋 ${agentName} - Günlük Özetin Hazır`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #6366f1;">${agentName}</h2>
          <p style="color: #666;">Bugünkü günlük özetin hazır:</p>
          <div style="background: #f9fafb; padding: 16px; border-radius: 12px; margin-top: 12px;">
            <p style="white-space: pre-line; color: #333;">${dailySummary}</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Bu email Agentic platformu tarafından otomatik gönderilmiştir.</p>
        </div>
      `,
    });
    console.log(`Email gönderildi: ${toEmail}`);
  } catch (error) {
    console.error('Email gönderme hatası:', error.message);
  }
};

module.exports = { sendReportEmail };