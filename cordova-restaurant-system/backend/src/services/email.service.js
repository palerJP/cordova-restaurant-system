const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const env = require('../config/env');

const APP_URL = env.clientUrl;
const FROM_EMAIL = env.email.from;

function createTransporter() {
  if (env.email.smtpHost && env.email.smtpUser && env.email.smtpPass) {
    return nodemailer.createTransport({
      host: env.email.smtpHost,
      port: env.email.smtpPort,
      secure: env.email.smtpSecure,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      auth: {
        user: env.email.smtpUser,
        pass: env.email.smtpPass,
      },
    });
  }
  return null;
}

/**
 * Sends a real transactional email via SMTP, Resend API, or falls back to logger in dev.
 */
async function sendEmail({ to, subject, html, text }) {
  // 1. Try Resend API if API Key is configured
  if (env.email.resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        signal: AbortSignal.timeout(15000),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.email.resendApiKey}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject,
          html,
          text,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        logger.error('Resend API email dispatch error:', errData);
      } else {
        logger.info(`Email sent via Resend to ${to}: ${subject}`);
        return true;
      }
    } catch (err) {
      logger.error('Resend API exception:', err);
    }
  }

  // 2. Try Nodemailer SMTP if configured
  const transporter = createTransporter();
  if (transporter) {
    try {
      const result = await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text,
      });
      if (!result.accepted?.some((address) => address.toLowerCase() === to.toLowerCase())) {
        throw new Error('SMTP provider did not accept the recipient');
      }
      logger.info('Email accepted by SMTP provider', { messageId: result.messageId, subject });
      return true;
    } catch (err) {
      logger.error('Nodemailer SMTP exception:', err);
    }
  }

  // Production never logs private verification or reset links as a fallback.
  if (env.isProduction) {
    throw new Error('Email delivery failed');
  }

  // Local development fallback.
  logger.info(`=======================================================`);
  logger.info(`[LOCAL DEV EMAIL DISPATCH]`);
  logger.info(`To: ${to}`);
  logger.info(`Subject: ${subject}`);
  logger.info(`Text Content:\n${text}`);
  logger.info(`=======================================================`);

  return true;
}

/**
 * Sends an email verification link to a newly registered user.
 */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

async function sendVerificationEmail(toEmail, userName, rawToken, { welcome = false } = {}) {
  const verifyUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(rawToken)}`;
  const subject = welcome ? 'Welcome to CordovaEats! Verify your email' : 'Verify your CordovaEats Email Account';
  const safeName = escapeHtml(userName || 'there');

  const text = `Hello ${userName || 'Diner'},\n\nPlease verify your email address for CordovaEats by clicking the link below:\n${verifyUrl}\n\nThis link will expire in 30 minutes.\n\nIf you did not create a CordovaEats account, please ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h1 style="color: #1b241f; margin: 0;">CordovaEats</h1>
        <p style="color: #d97706; font-size: 14px; font-weight: bold; margin-top: 5px; text-transform: uppercase;">Cordova's Culinary Journey</p>
      </div>
      <div style="background-color: #fdfbf7; padding: 25px; border-radius: 8px; border: 1px solid #f3ebd8;">
        <h2 style="color: #1b241f; margin-top: 0;">${welcome ? 'Welcome to CordovaEats!' : 'Verify Your Email Address'}</h2>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
          Hi <strong>${safeName}</strong>, thanks for joining our dining community. Please verify your email address to complete your account setup and discover places to eat in Cordova, save your favorites, and share your experiences.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #d97706; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
          Or copy and paste this verification link into your browser:<br/>
          <a href="${verifyUrl}" style="color: #d97706; word-break: break-all;">${verifyUrl}</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 25px;">
          Note: This verification link expires in 30 minutes. If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, html, text });
}

/**
 * Sends a password reset link to a user.
 */
async function sendPasswordResetEmail(toEmail, userName, rawToken) {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const subject = 'Reset your CordovaEats Password';

  const text = `Hello ${userName || 'User'},\n\nYou requested a password reset for your CordovaEats account. Click the link below to set a new password:\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded-lg: 8px;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h1 style="color: #1b241f; margin: 0;">CordovaEats</h1>
        <p style="color: #d97706; font-size: 14px; font-weight: bold; margin-top: 5px; text-transform: uppercase;">Cordova's Culinary Journey</p>
      </div>
      <div style="background-color: #fdfbf7; padding: 25px; border-radius: 8px; border: 1px solid #f3ebd8;">
        <h2 style="color: #1b241f; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
          Hi <strong>${escapeHtml(userName || 'there')}</strong>, we received a request to reset your password for your CordovaEats account.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1b241f; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
          Or copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #d97706; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 25px;">
          Note: This password reset link expires in 15 minutes. If you did not request a password reset, please ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, html, text });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
