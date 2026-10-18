jest.mock('nodemailer', () => ({ createTransport: jest.fn() }));
jest.mock('../../src/utils/logger', () => ({ info: jest.fn(), error: jest.fn() }));

const nodemailer = require('nodemailer');
const env = require('../../src/config/env');
const email = require('../../src/services/email.service');
const originalEmail = { ...env.email };
const originalProduction = env.isProduction;
const sendMail = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  env.isProduction = true;
  Object.assign(env.email, { resendApiKey: null, smtpHost: 'smtp.example.com', smtpPort: 465,
    smtpSecure: true, smtpUser: 'sender@example.com', smtpPass: 'test-secret' });
  nodemailer.createTransport.mockReturnValue({ sendMail });
});
afterAll(() => { Object.assign(env.email, originalEmail); env.isProduction = originalProduction; });

test('signup sends a branded welcome with a single-use verification link', async () => {
  sendMail.mockResolvedValue({ accepted: ['diner@example.com'], messageId: 'message-1' });
  await email.sendVerificationEmail('diner@example.com', '<Diner & Friend>', 'token/+value', { welcome: true });
  const message = sendMail.mock.calls[0][0];
  expect(message.subject).toBe('Welcome to CordovaEats! Verify your email');
  expect(message.html).toContain('&lt;Diner &amp; Friend&gt;');
  expect(message.html).not.toContain('<Diner & Friend>');
  expect(message.text).toContain('/verify-email?token=token%2F%2Bvalue');
  expect(message.html).toContain('Verify Email Address');
  expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({ connectionTimeout: 10000, socketTimeout: 20000 }));
});

test('SMTP rejection is never reported as successful delivery', async () => {
  sendMail.mockResolvedValue({ accepted: [], rejected: ['diner@example.com'] });
  await expect(email.sendVerificationEmail('diner@example.com', 'Diner', 'token')).rejects.toThrow('Email delivery failed');
});

test('production does not silently pretend to send when email is unconfigured', async () => {
  env.email.smtpPass = null;
  await expect(email.sendVerificationEmail('diner@example.com', 'Diner', 'token')).rejects.toThrow('Email delivery failed');
  expect(sendMail).not.toHaveBeenCalled();
});

test('resending verification keeps the verification subject', async () => {
  sendMail.mockResolvedValue({ accepted: ['diner@example.com'], messageId: 'message-2' });
  await email.sendVerificationEmail('diner@example.com', 'Diner', 'token');
  expect(sendMail.mock.calls[0][0].subject).toBe('Verify your CordovaEats Email Account');
});
