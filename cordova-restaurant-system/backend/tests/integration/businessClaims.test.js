const request = require('supertest');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const describeWithDb = process.env.DATABASE_URL ? describe : describe.skip;
jest.mock('../../src/services/restaurantSync.service', () => ({
  syncToRestaurantTs: jest.fn(), removeFromRestaurantTs: jest.fn(),
  getDefaultCoverImage: jest.fn(), inferCategory: jest.fn(),
}));

describeWithDb('business ownership claims', () => {
  let app, query, users, tokens, originalOwner;
  const files = [];
  const pdf = Buffer.from('%PDF-1.4\nOwnership test evidence\n%%EOF');
  beforeAll(async () => {
    app = require('../../src/app'); query = require('../../src/config/db').query;
    const { signAccessToken } = require('../../src/utils/jwt');
    users = {}; tokens = {};
    for (const name of ['alice','bob','admin','unverified','owner']) {
      const id = randomUUID(), role = name === 'admin' ? 'admin' : name === 'owner' ? 'owner' : 'customer';
      await query('INSERT INTO users(id,email,full_name,role,email_verified) VALUES($1,$2,$3,$4,$5)', [id, `${id}@example.com`, name, role, name !== 'unverified']);
      users[name] = id; tokens[name] = signAccessToken({ id, role });
    }
    originalOwner = users.owner;
  });
  afterAll(async () => {
    const directory = require('../../src/middleware/claimEvidence').directory();
    for (const filename of files) await fs.unlink(path.join(directory, filename)).catch(() => {});
  });
  async function restaurant(claimed = false) {
    const id = randomUUID();
    await query("INSERT INTO restaurants(id,owner_id,name,slug,address,latitude,longitude,status,ownership_claimed) VALUES($1,$2,'Claim Test',$4,'Test address',10,123,'verified',$3)", [id, originalOwner, claimed, id]);
    return id;
  }
  function submit(id, name = 'alice', buffer = pdf, dispute = false) {
    return request(app).post(`/api/restaurants/${id}/claims`).set('Authorization', `Bearer ${tokens[name]}`)
      .field('applicantName', 'Test Applicant').field('relationship', 'Business owner').field('phone', '09123456789')
      .field('explanation', 'I own this establishment and provide my permit as evidence.')
      .field('confirmOwnership', 'true').field('isDispute', String(dispute)).attach('evidence', buffer, { filename: 'permit.pdf', contentType: 'application/pdf' });
  }
  async function claim(id, name = 'alice', dispute = false) {
    const result = await submit(id, name, pdf, dispute);
    expect(result.status).toBe(201);
    const documents = await query('SELECT filename FROM business_claim_documents WHERE claim_id=$1', [result.body.data.id]);
    files.push(...documents.rows.map(doc => doc.filename));
    return result.body.data.id;
  }
  function review(id, action, name = 'admin', extra = {}) {
    return request(app).patch(`/api/admin/claims/${id}/review`).set('Authorization', `Bearer ${tokens[name]}`).send({ action, note: 'Ownership evidence independently reviewed.', ...extra });
  }
  test('migration marks municipal listings unclaimed without enabling their account', async () => {
    const { rows } = await query("SELECT r.ownership_claimed,u.is_active FROM restaurants r JOIN users u ON u.id=r.owner_id WHERE u.email='unclaimed-listings@cordova-restaurants.gov.ph'");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(row => !row.ownership_claimed && !row.is_active)).toBe(true);
  });
  test('submission requires authentication and a verified non-admin account', async () => {
    const id = await restaurant();
    expect((await request(app).post(`/api/restaurants/${id}/claims`)).status).toBe(401);
    expect((await submit(id, 'unverified')).status).toBe(403);
    expect((await submit(id, 'admin')).status).toBe(403);
  });
  test('rejects spoofed evidence, oversized files, bad IDs and missing declarations', async () => {
    const id = await restaurant();
    expect((await submit(id, 'alice', Buffer.from('<html>not a permit</html>'))).status).toBe(400);
    expect((await submit(id, 'alice', Buffer.alloc(5 * 1024 * 1024 + 1))).status).toBe(413);
    expect((await submit('invalid-id')).status).toBe(400);
    const result = await request(app).post(`/api/restaurants/${id}/claims`).set('Authorization', `Bearer ${tokens.alice}`)
      .field('applicantName', 'Applicant').field('relationship', 'Owner').field('phone', '123456789')
      .field('explanation', 'Truthful ownership application with sufficient information').attach('evidence', pdf, 'permit.pdf');
    expect(result.status).toBe(400);
  });
  test('prevents duplicates but accepts a competing claimant and leaves ownership unchanged', async () => {
    const id = await restaurant();
    await claim(id);
    expect((await submit(id)).status).toBe(409);
    await claim(id, 'bob');
    const { rows } = await query('SELECT owner_id FROM restaurants WHERE id=$1', [id]);
    expect(rows[0].owner_id).toBe(originalOwner);
    const result = await request(app).patch(`/api/restaurants/${id}`).set('Authorization', `Bearer ${tokens.alice}`).send({ name: 'Hijack' });
    expect(result.status).toBe(403);
  });
  test('accepts real image evidence, re-encodes it, and does not trust the supplied MIME type', async () => {
    const id = await restaurant();
    const png = await require('sharp')({ create: { width: 20, height: 20, channels: 3, background: '#ffffff' } }).png().toBuffer();
    const response = await submit(id, 'alice', png);
    expect(response.status).toBe(201);
    const documents = await query('SELECT filename FROM business_claim_documents WHERE claim_id=$1', [response.body.data.id]);
    files.push(documents.rows[0].filename);
    expect(documents.rows[0].filename).toMatch(/\.webp$/);
    const metadata = await require('sharp')(path.join(require('../../src/middleware/claimEvidence').directory(), documents.rows[0].filename)).metadata();
    expect(metadata.format).toBe('webp');
  });
  test('only the applicant and admins can see claim details and download evidence', async () => {
    const id = await restaurant(), application = await claim(id);
    const owner = await request(app).get(`/api/claims/${application}`).set('Authorization', `Bearer ${tokens.alice}`);
    expect(owner.status).toBe(200);
    const document = owner.body.data.documents[0].id;
    expect(owner.body.data.documents[0].filename).toBeUndefined();
    expect((await request(app).get(`/api/claims/${application}`)).status).toBe(401);
    expect((await request(app).get(`/api/claims/${application}`).set('Authorization', `Bearer ${tokens.bob}`)).status).toBe(404);
    expect((await request(app).get(`/api/claims/${application}/documents/${document}`).set('Authorization', `Bearer ${tokens.bob}`)).status).toBe(404);
    for (const name of ['alice','admin']) {
      const response = await request(app).get(`/api/claims/${application}/documents/${document}`).set('Authorization', `Bearer ${tokens[name]}`);
      expect(response.status).toBe(200); expect(response.headers['cache-control']).toBe('private, no-store');
      expect(response.headers['content-disposition']).toMatch(/attachment/);
    }
    const filename = (await query('SELECT filename FROM business_claim_documents WHERE claim_id=$1', [application])).rows[0].filename;
    expect((await request(app).get(`/uploads/claim-evidence/${filename}`)).status).toBe(404);
    expect((await request(app).get(`/api/claims/${application}/documents/${randomUUID()}`).set('Authorization', `Bearer ${tokens.alice}`)).status).toBe(404);
  });
  test('request information, answer with new evidence, and retain the entire history', async () => {
    const id = await restaurant(), application = await claim(id);
    expect((await review(application, 'info_requested')).status).toBe(200);
    expect((await review(application, 'approved')).status).toBe(409);
    const response = await request(app).post(`/api/claims/${application}/respond`).set('Authorization', `Bearer ${tokens.alice}`).field('message', 'Here is the additional proof you requested.').attach('evidence', pdf, 'additional.pdf');
    expect(response.status).toBe(200);
    const documents = await query('SELECT filename FROM business_claim_documents WHERE claim_id=$1', [application]);
    files.push(documents.rows[1].filename);
    const detail = await request(app).get(`/api/claims/${application}`).set('Authorization', `Bearer ${tokens.admin}`);
    expect(detail.body.data.claim.status).toBe('pending');
    expect(detail.body.data.documents).toHaveLength(2);
    expect(detail.body.data.events.map(event => event.action)).toEqual(['submitted','info_requested','resubmitted']);
  });
  test('competing approvals serialize, preserve listing data and remove prior owner access', async () => {
    const id = await restaurant(), a = await claim(id), b = await claim(id, 'bob');
    const category = randomUUID();
    await query("INSERT INTO menu_categories(id,restaurant_id,name) VALUES($1,$2,'Existing menu')", [category, id]);
    const results = await Promise.all([review(a, 'approved'), review(b, 'approved')]);
    expect(results.map(result => result.status).sort()).toEqual([200,409]);
    const { rows } = await query('SELECT owner_id,ownership_claimed,name FROM restaurants WHERE id=$1', [id]);
    expect([users.alice,users.bob]).toContain(rows[0].owner_id);
    expect(rows[0].ownership_claimed).toBe(true); expect(rows[0].name).toBe('Claim Test');
    expect((await query('SELECT id FROM menu_categories WHERE id=$1 AND restaurant_id=$2', [category,id])).rows).toHaveLength(1);
    const winningName = rows[0].owner_id === users.alice ? 'alice' : 'bob';
    const winnerRole = await query('SELECT role FROM users WHERE id=$1', [rows[0].owner_id]);
    expect(winnerRole.rows[0].role).toBe('owner');
    expect((await request(app).patch(`/api/restaurants/${id}`).set('Authorization', `Bearer ${tokens.owner}`).send({ description: 'Unauthorized change' })).status).toBe(403);
    expect((await request(app).patch(`/api/restaurants/${id}`).set('Authorization', `Bearer ${tokens[winningName]}`).send({ description: 'Approved owner update' })).status).toBe(200);
    const audit = await query("SELECT id FROM audit_logs WHERE entity_type='business_claim' AND entity_id=ANY($1::uuid[])", [[a,b]]);
    expect(audit.rows.length).toBeGreaterThanOrEqual(4);
  });
  test('only admins review; self-review and short reasons are rejected', async () => {
    const id = await restaurant(), application = await claim(id);
    expect((await review(application, 'approved', 'alice')).status).toBe(403);
    expect((await request(app).patch(`/api/admin/claims/${application}/review`).set('Authorization', `Bearer ${tokens.admin}`).send({ action: 'approved', note: 'ok' })).status).toBe(400);
    await query("UPDATE users SET role='admin' WHERE id=$1", [users.alice]);
    expect((await review(application, 'approved', 'alice')).status).toBe(403);
    await query("UPDATE users SET role='customer' WHERE id=$1", [users.alice]);
  });
  test('withdrawal does not transfer ownership and permits a later application', async () => {
    const id = await restaurant(), application = await claim(id);
    expect((await request(app).post(`/api/claims/${application}/withdraw`).set('Authorization', `Bearer ${tokens.bob}`)).status).toBe(404);
    expect((await request(app).post(`/api/claims/${application}/withdraw`).set('Authorization', `Bearer ${tokens.alice}`)).status).toBe(200);
    expect((await review(application, 'approved')).status).toBe(409);
    await claim(id);
  });
  test('owned listings require a dispute and explicit admin transfer confirmation', async () => {
    const id = await restaurant(true);
    expect((await submit(id)).status).toBe(409);
    const application = await claim(id, 'alice', true);
    expect((await review(application, 'approved')).status).toBe(400);
    expect((await review(application, 'approved', 'admin', { confirmTransfer: true })).status).toBe(200);
    const notice = await query("SELECT body FROM notifications WHERE user_id=$1 AND title='Business ownership changed'", [users.owner]);
    expect(notice.rows.length).toBeGreaterThan(0);
  });
  test('rejects stale ownership snapshots and inactive applicants', async () => {
    const id = await restaurant(), application = await claim(id);
    await query('UPDATE restaurants SET owner_id=$2 WHERE id=$1', [id,users.bob]);
    expect((await review(application, 'approved')).status).toBe(409);
    const another = await restaurant(), otherClaim = await claim(another);
    await query('UPDATE users SET is_active=FALSE WHERE id=$1', [users.alice]);
    expect((await review(otherClaim, 'approved')).status).toBe(409);
    await query('UPDATE users SET is_active=TRUE WHERE id=$1', [users.alice]);
  });
  test('support messages and notifications are private and do not reopen decisions', async () => {
    const id = await restaurant(), application = await claim(id);
    expect((await review(application, 'rejected')).status).toBe(200);
    expect((await request(app).post(`/api/claims/${application}/support`).set('Authorization', `Bearer ${tokens.alice}`).send({ message: 'Please clarify why this application was rejected.' })).status).toBe(200);
    expect((await request(app).post(`/api/admin/claims/${application}/message`).set('Authorization', `Bearer ${tokens.admin}`).send({ message: 'Submit a new application with a current business permit.' })).status).toBe(200);
    const detail = await request(app).get(`/api/claims/${application}`).set('Authorization', `Bearer ${tokens.alice}`);
    expect(detail.body.data.claim.status).toBe('rejected');
    expect(detail.body.data.events.at(-1).action).toBe('support_response');
    const inbox = await request(app).get('/api/claims/notifications').set('Authorization', `Bearer ${tokens.alice}`);
    expect(inbox.status).toBe(200); expect(inbox.body.data.length).toBeGreaterThan(0);
    const notification = inbox.body.data[0].id;
    expect((await request(app).patch(`/api/claims/notifications/${notification}/read`).set('Authorization', `Bearer ${tokens.bob}`)).status).toBe(404);
    expect((await request(app).patch(`/api/claims/notifications/${notification}/read`).set('Authorization', `Bearer ${tokens.alice}`)).status).toBe(200);
    expect((await request(app).post(`/api/claims/${application}/support`).set('Authorization', `Bearer ${tokens.bob}`).send({ message: 'Unauthorized support message injection.' })).status).toBe(404);
  });
});
