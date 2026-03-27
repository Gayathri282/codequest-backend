// backend/src/services/email.service.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail({ to, name }) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@codequest.in',
      to,
      subject: '🚀 Welcome to CodeQuest — Start Your Coding Adventure!',
      html: `
        <div style="font-family: 'Nunito', sans-serif; max-width: 600px; margin: 0 auto; background: #E0F7FF; padding: 32px; border-radius: 20px;">
          <h1 style="color: #FF6B35; font-size: 32px;">Welcome to CodeQuest, ${name}! 🏃</h1>
          <p style="font-size: 18px; color: #1A2340;">
            You're about to embark on the most fun coding adventure ever!
          </p>
          <ul style="font-size: 16px; color: #1A2340; line-height: 2;">
            <li>🌐 Build real websites with HTML & CSS</li>
            <li>🪙 Collect coins and level up</li>
            <li>🏆 Earn badges as you progress</li>
            <li>💻 Write code in the live editor</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/login"
             style="display: inline-block; background: #FF6B35; color: #fff; padding: 14px 32px; border-radius: 14px; text-decoration: none; font-size: 18px; font-weight: bold; margin-top: 20px;">
            🏃 Start Playing Now!
          </a>
        </div>
      `
    });
  } catch (err) {
    console.error('[EMAIL] Failed to send welcome email:', err.message);
    // Non-fatal — don't crash the registration
  }
}

async function sendProgressReport({ to, studentName, report }) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: `📊 ${studentName}'s Weekly Progress Report — CodeQuest`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>📊 Weekly Progress for ${studentName}</h2>
          <p>XP this week: <strong>${report.weeklyXp}</strong></p>
          <p>Current Level: <strong>${report.level}</strong></p>
          <p>Streak: <strong>${report.streakDays} days 🔥</strong></p>
          <p>Sessions completed: <strong>${report.completed}</strong></p>
        </div>
      `
    });
  } catch (err) {
    console.error('[EMAIL] Failed to send progress report:', err.message);
  }
}

module.exports = { sendWelcomeEmail, sendProgressReport };
