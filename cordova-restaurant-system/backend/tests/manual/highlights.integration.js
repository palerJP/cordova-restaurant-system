/* Run with: node tests/manual/highlights.integration.js (local PostgreSQL required). */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const sharp = require('sharp');
const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/config/db');
const { signAccessToken } = require('../../src/utils/jwt');

async function main() {
  const suffix = crypto.randomUUID().slice(0, 8);
  const users = [];
  let highlightId;
  let restaurantId;
  async function user(role) {
    const result = await pool.query(
      'INSERT INTO users(email,password_hash,full_name,role,email_verified_at) VALUES($1,$2,$3,$4,now()) RETURNING *',
      [`highlight-${role}-${users.length}-${suffix}@example.test`, 'test-only-no-login', `Highlight ${role}`, role]
    );
    users.push(result.rows[0].id);
    return result.rows[0];
  }

  try {
    const owner = await user('owner');
    const customer = await user('customer');
    const stranger = await user('customer');
    const admin = await user('admin');
    const token = (entry) => `Bearer ${signAccessToken(entry)}`;
    const ownerToken = token(owner);
    const customerToken = token(customer);
    const strangerToken = token(stranger);
    const adminToken = token(admin);
    const restaurant = await pool.query(
      "INSERT INTO restaurants(owner_id,name,slug,address,latitude,longitude,status) VALUES($1,$2,$3,'Cordova, Cebu',10.25,123.95,'verified') RETURNING id",
      [owner.id, `Highlight Test ${suffix}`, `highlight-test-${suffix}`]
    );
    restaurantId = restaurant.rows[0].id;
    const prefix = `/api/restaurants/${restaurantId}/highlights`;
    const photo = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#00aa55' } }).png().toBuffer();

    let response = await request(app).get(prefix).expect(200);
    assert.equal(response.body.data.length, 0, 'guest sees approved list only');
    await request(app).post(prefix).field('caption', 'Guest').field('category', 'Food').attach('photos', photo, 'test.png').expect(401);

    response = await request(app).post(prefix).set('Authorization', customerToken)
      .field('caption', 'Wonderful food').field('category', 'Food').attach('photos', photo, 'test.png').expect(201);
    highlightId = response.body.data.id;
    assert.equal(response.body.data.status, 'approved');
    response = await request(app).get(prefix).expect(200);
    assert.equal(response.body.data[0].id, highlightId, 'new photo appears in the public gallery immediately');
    response = await request(app).get(`/api/highlights/mine?restaurantId=${restaurantId}`).set('Authorization', customerToken).expect(200);
    assert.equal(response.body.data[0].id, highlightId);
    const imageUrl = response.body.data[0].images[0].url;
    await request(app).get(imageUrl).expect(200);
    await request(app).get(imageUrl).set('Authorization', customerToken).expect(200);
    await request(app).get(imageUrl).set('Authorization', strangerToken).expect(200);
    response = await request(app).get(`${prefix}/submissions`).set('Authorization', ownerToken).expect(200);
    assert.equal(response.body.data[0].id, highlightId);

    await request(app).patch(`/api/highlights/${highlightId}`).set('Authorization', strangerToken)
      .send({ caption: 'Unauthorized edit', category: 'Food' }).expect(404);
    await request(app).delete(`/api/highlights/${highlightId}`).set('Authorization', strangerToken).expect(404);
    await request(app).patch(`/api/highlights/${highlightId}`).set('Authorization', ownerToken)
      .send({ caption: 'Owner edit', category: 'Food' }).expect(403);
    await request(app).post(prefix).set('Authorization', customerToken)
      .field('caption', 'Bad photo').field('category', 'Food').attach('photos', Buffer.from('not-an-image'), 'bad.png').expect(400);
    await request(app).post(prefix).set('Authorization', customerToken)
      .field('caption', 'Bad type').field('category', 'Food').attach('photos', Buffer.from('abc'), 'bad.txt').expect(400);

    await request(app).patch(`/api/highlights/${highlightId}`).set('Authorization', customerToken)
      .field('caption', 'Updated visit').field('category', 'Ambience').attach('photos', photo, 'replacement.png').expect(200);
    response = await request(app).get(prefix).expect(200);
    assert.equal(response.body.data[0].caption, 'Updated visit', 'edit appears in the public gallery immediately');
    await request(app).get(imageUrl).set('Authorization', customerToken).expect(404);
    response = await request(app).get(`/api/highlights/mine?restaurantId=${restaurantId}`).set('Authorization', customerToken).expect(200);
    const replacementUrl = response.body.data[0].images[0].url;
    assert.notEqual(replacementUrl, imageUrl, 'editing photos replaces old images');
    await request(app).get(replacementUrl).expect(200);
    await request(app).patch(`/api/admin/highlights/${highlightId}/moderate`).set('Authorization', adminToken)
      .send({ status: 'rejected', reason: 'Image not appropriate' }).expect(200);
    response = await request(app).get(prefix).expect(200);
    assert.equal(response.body.data.length, 0, 'rejected stays hidden');
    await request(app).delete(`/api/highlights/${highlightId}`).set('Authorization', customerToken).expect(200);
    highlightId = null;
    console.log('PASS: immediate gallery publishing, guest, customer, owner, admin, image validation, moderation, and deletion flows');
  } finally {
    if (highlightId) await pool.query('DELETE FROM visit_highlights WHERE id=$1', [highlightId]);
    if (restaurantId) await pool.query('DELETE FROM restaurants WHERE id=$1', [restaurantId]);
    for (const id of users.reverse()) await pool.query('DELETE FROM users WHERE id=$1', [id]);
    await pool.end();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
