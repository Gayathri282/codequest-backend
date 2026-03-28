// backend/src/services/email.service.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail({ to, name }) {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
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

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: '🔑 Reset your CodeQuest password',
    html: `
      <div style="font-family:'Nunito',sans-serif;max-width:600px;margin:0 auto;background:#FFF8F5;padding:32px;border-radius:20px;border:2px solid #FFD4BA;">
        <h2 style="color:#FF6B35;font-size:26px;margin:0 0 12px;">Hey ${name}, forgot your password?</h2>
        <p style="font-size:16px;color:#1A0A00;">No worries! Click the button below to set a new one. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#FF6B35;color:#fff;padding:14px 32px;border-radius:14px;text-decoration:none;font-size:18px;font-weight:bold;margin:20px 0;">
          🔑 Reset My Password
        </a>
        <p style="font-size:13px;color:#8A7060;margin-top:20px;">If you didn't request this, just ignore this email — your password won't change.</p>
      </div>
    `,
  });
  if (result.error) {
    console.error('[EMAIL] Resend error:', result.error);
    throw new Error(result.error.message);
  }
}

module.exports = { sendWelcomeEmail, sendProgressReport, sendPasswordResetEmail };
