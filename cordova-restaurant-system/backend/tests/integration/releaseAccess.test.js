const request = require('supertest');
const { randomUUID } = require('node:crypto');
const describeWithDb = process.env.DATABASE_URL ? describe : describe.skip;

describeWithDb('release access boundaries', () => {
  let app, query, tokens, restaurantId, promotionId;
  beforeAll(async () => {
    app = require('../../src/app');
    query = require('../../src/config/db').query;
    const { signAccessToken } = require('../../src/utils/jwt');
    tokens = {};
    const ids = {};
    for (const role of ['customer', 'owner', 'admin']) {
      ids[role] = randomUUID();
      await query('INSERT INTO users (id, email, full_name, role, email_verified) VALUES ($1,$2,$3,$4,TRUE)', [ids[role], `${ids[role]}@example.com`, 'Release Test', role]);
      tokens[role] = signAccessToken({ id: ids[role], role, email: `${ids[role]}@example.com` });
    }
    restaurantId = randomUUID();
    promotionId = randomUUID();
    await query("INSERT INTO restaurants (id, owner_id, name, slug, address, latitude, longitude, status) VALUES ($1,$2,'Release Test',$3,'Test address',10,123,'verified')", [restaurantId, ids.owner, restaurantId]);
    await query("INSERT INTO promotions (id, restaurant_id, title, start_date, end_date, status, payment_status, payment_reference) VALUES ($1,$2,'Release Offer',CURRENT_DATE,CURRENT_DATE+7,'active','verified','PRIVATE-REFERENCE')", [promotionId, restaurantId]);
  });
  test('private documents reject guests and diners', async () => {
    expect((await request(app).get('/uploads/business-permits/example.pdf')).status).toBe(401);
    expect((await request(app).get('/uploads/%62usiness-permits/example.pdf')).status).toBe(404);
    expect((await request(app).get('/uploads/business-permits/example.pdf').set('Authorization', `Bearer ${tokens.customer}`)).status).toBe(403);
  });
  test('only admins can load promotion moderation', async () => {
    for (const role of ['customer', 'owner']) {
      const result = await request(app).get('/api/admin/promotions').set('Authorization', `Bearer ${tokens[role]}`);
      expect(result.status).toBe(403);
    }
    expect((await request(app).get('/api/admin/promotions').set('Authorization', `Bearer ${tokens.admin}`)).status).toBe(200);
  });
  test('public promotions omit payment references; owner gets management records', async () => {
    const guest = await request(app).get(`/api/restaurants/${restaurantId}/promotions`);
    expect(guest.status).toBe(200);
    expect(guest.body.data[0].payment_reference).toBeUndefined();
    const owner = await request(app).get(`/api/restaurants/${restaurantId}/promotions`).set('Authorization', `Bearer ${tokens.owner}`);
    expect(owner.body.data[0].payment_reference).toBe('PRIVATE-REFERENCE');
  });
  test('owners cannot mark their own payment verified', async () => {
    const result = await request(app).patch(`/api/restaurants/${restaurantId}/promotions/${promotionId}`).set('Authorization', `Bearer ${tokens.owner}`).send({ title: 'Changed', status: 'active', paymentStatus: 'verified' });
    expect(result.status).toBe(200);
    expect(result.body.data.promotion.payment_status).toBe('pending_verification');
    expect(result.body.data.promotion.status).toBe('pending_verification');
    const guest = await request(app).get(`/api/restaurants/${restaurantId}/promotions`);
    expect(guest.body.data).toEqual([]);
  });
});
