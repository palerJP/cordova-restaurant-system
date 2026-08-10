const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const env = require('../config/env');

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.EMAIL_FROM || 'CordovaEats <noreply@cordovaeats.com>';

function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
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
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
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
      await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text,
      });
      logger.info(`Email sent via SMTP to ${to}: ${subject}`);
      return true;
    } catch (err) {
      logger.error('Nodemailer SMTP exception:', err);
    }
  }

  // 3. Fallback for Local Development — Log clean link to console & logs
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
async function sendVerificationEmail(toEmail, userName, rawToken) {
  const verifyUrl = `${APP_URL}/verify-email?token=${rawToken}`;
  const subject = 'Verify your CordovaEats Email Account';

  const text = `Hello ${userName || 'Diner'},\n\nPlease verify your email address for CordovaEats by clicking the link below:\n${verifyUrl}\n\nThis link will expire in 30 minutes.\n\nIf you did not create a CordovaEats account, please ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded-lg: 8px;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h1 style="color: #1b241f; margin: 0;">CordovaEats</h1>
        <p style="color: #d97706; font-size: 14px; font-weight: bold; margin-top: 5px; text-transform: uppercase;">Cordova's Culinary Journey</p>
      </div>
      <div style="background-color: #fdfbf7; padding: 25px; border-radius: 8px; border: 1px solid #f3ebd8;">
        <h2 style="color: #1b241f; margin-top: 0;">Verify Your Email Address</h2>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
          Hi <strong>${userName || 'there'}</strong>, welcome to CordovaEats! Please verify your email address to complete your account setup and access personalized dining recommendations, reviews, and exclusive deals.
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
  const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`;
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
          Hi <strong>${userName || 'there'}</strong>, we received a request to reset your password for your CordovaEats account.
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
