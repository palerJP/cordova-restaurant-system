jest.mock('../../src/config/db', () => ({ query: jest.fn() }));
jest.mock('../../src/services/email.service', () => ({ sendEmail: jest.fn() }));
const express = require('express');
const request = require('supertest');
const { query } = require('../../src/config/db');
const { sendEmail } = require('../../src/services/email.service');
const marketing = require('../../src/services/marketing.service');
const router = require('../../src/routes/marketing.routes');
const user = { id: '00000000-0000-4000-8000-000000000001', email: 'subscriber@example.com' };
beforeEach(() => { jest.clearAllMocks(); });

test('campaign dry run filters consent, verification and active status without sending', async () => {
  query.mockResolvedValue({ rows: [user] });
  const result = await marketing.runCampaign();
  expect(result).toMatchObject({ eligible: 1, sent: 0, dryRun: true });
  expect(query.mock.calls[0][0]).toContain('is_active=true AND email_verified=true AND accepts_marketing=true');
  expect(sendEmail).not.toHaveBeenCalled();
});

test('campaign sends individually with an unsubscribe link and records acceptance', async () => {
  query.mockResolvedValueOnce({ rows: [user] }).mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValueOnce({ rowCount: 1 });
  sendEmail.mockResolvedValue(true);
  expect(await marketing.runCampaign({ send: true })).toMatchObject({ sent: 1, failed: 0 });
  expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: user.email, headers: expect.objectContaining({ 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }) }));
  expect(query.mock.calls[2][0]).toContain("status='sent'");
});

test('previously claimed recipients cannot receive duplicates', async () => {
  query.mockResolvedValueOnce({ rows: [user] }).mockResolvedValueOnce({ rowCount: 0 });
  expect(await marketing.runCampaign({ send: true })).toMatchObject({ sent: 0, skipped: 1 });
  expect(sendEmail).not.toHaveBeenCalled();
});

test('failed delivery is recorded without automatic duplicate retries', async () => {
  query.mockResolvedValueOnce({ rows: [user] }).mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValueOnce({ rowCount: 1 });
  sendEmail.mockRejectedValue(new Error('SMTP rejected'));
  expect(await marketing.runCampaign({ send: true })).toMatchObject({ failed: 1, sent: 0 });
  expect(query.mock.calls[2][0]).toContain("status='failed'");
});

test('unsubscribe tokens cannot be forged or reused for another user', () => {
  const token = marketing.unsubscribeToken(user.id);
  expect(marketing.readUnsubscribeToken(token)).toBe(user.id);
  expect(() => marketing.readUnsubscribeToken(token.replace('4000', '5000'))).toThrow('Invalid unsubscribe link');
  expect(() => marketing.readUnsubscribeToken('invalid')).toThrow('Invalid unsubscribe link');
});

test('opening unsubscribe confirmation does not change preferences; submitting does', async () => {
  const app = express(); app.use(express.json()); app.use(router);
  const url = `/unsubscribe?token=${marketing.unsubscribeToken(user.id)}`;
  await request(app).get(url).expect(200);
  expect(query).not.toHaveBeenCalled();
  query.mockResolvedValue({ rowCount: 1 });
  await request(app).post(url).expect(200);
  expect(query).toHaveBeenCalledWith('UPDATE users SET accepts_marketing=false WHERE id=$1', [user.id]);
});

test('campaign execution is inaccessible without an operations credential', async () => {
  const app = express(); app.use(express.json()); app.use(router);
  app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ message: err.message }));
  await request(app).post('/send').send({ send: true }).expect(401);
  expect(query).not.toHaveBeenCalled();
});
