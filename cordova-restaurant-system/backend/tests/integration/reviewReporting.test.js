const request = require('supertest');
const { randomUUID } = require('crypto');
const describeDb = process.env.DATABASE_URL ? describe : describe.skip;
describeDb('review reporting and moderation', () => {
  let app, query, id, restaurant, tokens;
  beforeAll(async () => {
    app = require('../../src/app');
    query = require('../../src/config/db').query;
    const { signAccessToken } = require('../../src/utils/jwt');
    const users = {}; tokens = {};
    for (const role of ['customer', 'owner', 'admin']) {
      const uid = randomUUID(); users[role] = uid;
      await query('INSERT INTO users(id,email,full_name,role,email_verified) VALUES($1,$2,$3,$4,true)', [uid, uid+'@example.com', role, role]);
      tokens[role] = signAccessToken({ id: uid, role });
    }
    restaurant = randomUUID(); id = randomUUID();
    await query("INSERT INTO restaurants(id,owner_id,name,slug,address,latitude,longitude,status) VALUES($1,$2,'Review test',$3,'Test',10,123,'verified')", [restaurant, users.owner, restaurant]);
    await query("INSERT INTO reviews(id,restaurant_id,user_id,rating,comment) VALUES($1,$2,$3,1,'Honest negative experience')", [id, restaurant, users.customer]);
  });
  const report = (who='owner', body={category:'spam',details:'Please investigate this review'}) => request(app).post('/api/reviews/'+id+'/report').set('Authorization','Bearer '+tokens[who]).send(body);
  const moderate = (status, reason='Reviewed the evidence carefully') => request(app).patch('/api/admin/reviews/'+id+'/moderate').set('Authorization','Bearer '+tokens.admin).send({status,flaggedReason:reason});
  test('authenticated validated reporting, private evidence, duplicate protection and fair moderation', async () => {
    expect((await request(app).post('/api/reviews/'+id+'/report')).status).toBe(401);
    expect((await report('owner',{category:'fake',details:'short'})).status).toBe(400);
    expect((await report('customer')).status).toBe(400);
    expect((await report()).status).toBe(201);
    expect((await report()).status).toBe(409);
    expect((await query('SELECT status FROM reviews WHERE id=$1',[id])).rows[0].status).toBe('visible');
    expect((await request(app).get('/api/admin/reviews?status=reported').set('Authorization','Bearer '+tokens.customer)).status).toBe(403);
    const queue = await request(app).get('/api/admin/reviews?status=reported').set('Authorization','Bearer '+tokens.admin);
    expect(queue.status).toBe(200);
    const review = queue.body.data.find(r=>r.id===id);
    expect(Number(review.report_count)).toBe(1);
    expect(review.reports[0].snapshot.comment).toBe('Honest negative experience');
    expect(review.reports[0].reporter_id).toBeUndefined();
    expect((await moderate('visible','')).status).toBe(400);
    expect((await moderate('visible')).status).toBe(200);
    expect((await query('SELECT status FROM review_reports WHERE review_id=$1',[id])).rows[0].status).toBe('dismissed');
    expect((await query('SELECT * FROM review_moderation_events WHERE review_id=$1',[id])).rows.length).toBe(1);
    expect((await query("SELECT * FROM audit_logs WHERE entity_id=$1 AND action='review.moderate'",[id])).rows.length).toBe(1);
    expect((await moderate('removed')).status).toBe(200);
    const visible = await request(app).get('/api/restaurants/'+restaurant+'/reviews');
    expect(visible.body.data.some(r=>r.id===id)).toBe(false);
    expect((await query('SELECT review_count FROM restaurants WHERE id=$1',[restaurant])).rows[0].review_count).toBe(0);
    const hiddenStats=await request(app).get('/api/restaurants/review-stats');
    expect(hiddenStats.headers['cache-control']).toBe('no-store');
    expect(hiddenStats.body.data.find(r=>r.id===restaurant).review_count).toBe(0);
    expect((await report()).status).toBe(404);
    expect((await moderate('visible')).status).toBe(200);
    expect((await query('SELECT review_count FROM restaurants WHERE id=$1',[restaurant])).rows[0].review_count).toBe(1);
    const stats=await request(app).get('/api/restaurants/review-stats');
    expect(stats.body.data.find(r=>r.id===restaurant).review_count).toBe(1);
    expect(Number(stats.body.data.find(r=>r.id===restaurant).avg_rating)).toBe(1);
  });
  test('live totals follow customer edits, deletions and submissions', async()=>{
    const edit=await request(app).patch('/api/reviews/'+id).set('Authorization','Bearer '+tokens.customer).send({rating:5,comment:'An updated honest experience'});
    expect(edit.status).toBe(200);
    let response=await request(app).get('/api/restaurants/review-stats');
    expect(Number(response.body.data.find(r=>r.id===restaurant).avg_rating)).toBe(5);
    expect((await request(app).delete('/api/reviews/'+id).set('Authorization','Bearer '+tokens.customer)).status).toBe(200);
    response=await request(app).get('/api/restaurants/review-stats');expect(response.body.data.find(r=>r.id===restaurant).review_count).toBe(0);
    const created=await request(app).post('/api/restaurants/'+restaurant+'/reviews').set('Authorization','Bearer '+tokens.customer).send({rating:4,comment:'A real customer submitted review'});
    expect(created.status).toBe(201);
    response=await request(app).get('/api/restaurants/review-stats');expect(response.body.data.find(r=>r.id===restaurant).review_count).toBe(1);expect(Number(response.body.data.find(r=>r.id===restaurant).avg_rating)).toBe(4);
  });
  test('full totals remain correct when reviews span multiple pages',async()=>{
    for(let i=0;i<13;i++){
      const uid=randomUUID();await query("INSERT INTO users(id,email,full_name,role,email_verified) VALUES($1,$2,'Pagination diner','customer',true)",[uid,uid+'@example.com']);
      await query("INSERT INTO reviews(restaurant_id,user_id,rating,comment) VALUES($1,$2,3,'Pagination test review')",[restaurant,uid]);
    }
    const first=await request(app).get('/api/restaurants/'+restaurant+'/reviews?limit=12&page=1');
    const second=await request(app).get('/api/restaurants/'+restaurant+'/reviews?limit=12&page=2');
    expect(first.body.data).toHaveLength(12);expect(first.body.meta.totalCount).toBe(14);expect(second.body.data).toHaveLength(2);
    const stats=await request(app).get('/api/restaurants/review-stats');expect(stats.body.data.find(r=>r.id===restaurant).review_count).toBe(14);
  });

});
