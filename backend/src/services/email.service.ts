import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER
    ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
    : undefined,
});

async function send(to: string, subject: string, html: string) {
  // In development without SMTP configured, log instead of failing —
  // lets the rest of the auth flow be tested without real email creds.
  if (!env.SMTP_USER && !env.IS_PROD) {
    logger.debug(`[email:dev-mode] to=${to} subject="${subject}"\n${html}`);
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
  });
}

function wrapper(title: string, bodyHtml: string): string {
  return `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#FAF7F1;">
    <h1 style="font-family: Georgia, serif; color:#0B3D3A; font-size: 22px; margin-bottom: 8px;">MedConnect</h1>
    <h2 style="color:#1C2321; font-size: 18px; margin-bottom: 16px;">${title}</h2>
    <div style="color:#3E4744; font-size: 15px; line-height: 1.6;">${bodyHtml}</div>
    <p style="color:#6B7370; font-size: 12px; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
  </div>`;
}

export async function sendVerificationOtpEmail(to: string, otp: string, name: string) {
  await send(
    to,
    'Verify your MedConnect email',
    wrapper(
      `Hi ${name}, verify your email`,
      `<p>Your verification code is:</p>
       <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; color:#146B63;">${otp}</p>
       <p>This code expires in 10 minutes.</p>`
    )
  );
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, name: string) {
  await send(
    to,
    'Reset your MedConnect password',
    wrapper(
      `Hi ${name}, reset your password`,
      `<p>Click the button below to set a new password. This link expires in 30 minutes.</p>
       <p><a href="${resetUrl}" style="display:inline-block; background:#D9694F; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">Reset password</a></p>
       <p>Or paste this link: <br/>${resetUrl}</p>`
    )
  );
}

export async function sendDoctorApplicationReceivedEmail(to: string, name: string) {
  await send(
    to,
    'MedConnect — application received',
    wrapper(
      `Welcome, Dr. ${name}`,
      `<p>We've received your application and license documents. Our admin team verifies every doctor profile before it goes live — you'll get an email as soon as your account is approved, usually within 1–2 business days.</p>`
    )
  );
}
