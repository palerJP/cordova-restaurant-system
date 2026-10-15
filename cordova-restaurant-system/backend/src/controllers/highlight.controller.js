const { query, withTransaction } = require('../config/db');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildPageMeta } = require('../utils/pagination');
const images = require('../services/highlightImage.service');

const CATEGORIES = new Set(['Food', 'Ambience', 'Service', 'Overall Experience']);
const STATUSES = new Set(['pending', 'approved', 'rejected', 'removed']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuid(value) {
  if (!UUID.test(value || '')) throw ApiError.badRequest('Invalid identifier.');
  return value;
}

function fields(body) {
  const caption = typeof body.caption === 'string' ? body.caption.trim() : '';
  if (!caption || caption.length > 300) throw ApiError.badRequest('Caption must be 1 to 300 characters.');
  if (!CATEGORIES.has(body.category)) throw ApiError.badRequest('Choose a valid highlight category.');
  return { caption, category: body.category };
}

const SELECT = `SELECT h.id,h.customer_id,h.restaurant_id,h.caption,h.category,h.status,
  h.moderation_reason,h.created_at,h.updated_at,u.full_name AS customer_name,
  r.name AS restaurant_name,r.slug AS restaurant_slug,
  COALESCE((SELECT jsonb_agg(jsonb_build_object('id',i.id,'url','/api/highlights/images/' || i.id)
    ORDER BY i.sort_order) FROM visit_highlight_images i WHERE i.highlight_id=h.id),'[]'::jsonb) AS images
  FROM visit_highlights h JOIN users u ON u.id=h.customer_id
  JOIN restaurants r ON r.id=h.restaurant_id`;

async function list(where, params, req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const rows = await query(`${SELECT} WHERE ${where} ORDER BY h.created_at DESC,h.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]);
  const count = await query(`SELECT COUNT(*)::int AS count FROM visit_highlights h JOIN restaurants r ON r.id=h.restaurant_id WHERE ${where}`, params);
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, data: rows.rows, meta: buildPageMeta({ page, limit, totalCount: count.rows[0].count }) });
}

const publicList = asyncHandler(async (req, res) => list(
  "h.restaurant_id=$1 AND h.status='approved' AND r.status='verified' AND r.is_active=true",
  [uuid(req.params.restaurantId)], req, res
));

const mine = asyncHandler(async (req, res) => {
  const params = [req.user.id];
  let where = 'h.customer_id=$1';
  if (req.query.restaurantId) { params.push(uuid(req.query.restaurantId)); where += ' AND h.restaurant_id=$2'; }
  await list(where, params, req, res);
});

const ownerList = asyncHandler(async (req, res) => {
  const restaurant = await query('SELECT owner_id FROM restaurants WHERE id=$1', [uuid(req.params.restaurantId)]);
  if (!restaurant.rows.length || restaurant.rows[0].owner_id !== req.user.id) throw ApiError.notFound('Restaurant not found');
  await list('h.restaurant_id=$1', [req.params.restaurantId], req, res);
});

const adminList = asyncHandler(async (req, res) => {
  const status = req.query.status || 'approved';
  if (status !== 'all' && !STATUSES.has(status)) throw ApiError.badRequest('Invalid status filter.');
  await list(status === 'all' ? 'true' : 'h.status=$1', status === 'all' ? [] : [status], req, res);
});

const create = asyncHandler(async (req, res) => {
  uuid(req.params.restaurantId);
  const { caption, category } = fields(req.body);
  if (!req.files?.length || req.files.length > 5) throw ApiError.badRequest('Choose 1 to 5 photos.');
  const restaurant = await query("SELECT id FROM restaurants WHERE id=$1 AND status='verified' AND is_active=true", [req.params.restaurantId]);
  if (!restaurant.rows.length) throw ApiError.notFound('Restaurant not found');
  const refs = [];
  try {
    for (const file of req.files) refs.push(await images.save(file));
    const row = await withTransaction(async (client) => {
      const saved = await client.query(
        "INSERT INTO visit_highlights(customer_id,restaurant_id,caption,category,status) VALUES($1,$2,$3,$4,'approved') RETURNING id",
        [req.user.id, req.params.restaurantId, caption, category]
      );
      for (let n = 0; n < refs.length; n++) {
        await client.query('INSERT INTO visit_highlight_images(highlight_id,storage_ref,sort_order) VALUES($1,$2,$3)',
          [saved.rows[0].id, refs[n], n]);
      }
      return saved.rows[0];
    });
    res.status(201).json({ success: true, message: 'Photo added to the gallery.', data: { id: row.id, status: 'approved' } });
  } catch (error) {
    await Promise.allSettled(refs.map(images.remove));
    throw error;
  }
});

const update = asyncHandler(async (req, res) => {
  uuid(req.params.id);
  const { caption, category } = fields(req.body);
  const replacements = [];
  try {
    for (const file of req.files || []) replacements.push(await images.save(file));
    const result = await withTransaction(async (client) => {
      const owned = await client.query("SELECT id FROM visit_highlights WHERE id=$1 AND customer_id=$2 AND status<>'removed' FOR UPDATE", [req.params.id, req.user.id]);
      if (!owned.rows.length) throw ApiError.notFound('Highlight not found or not yours');
      let previousRefs = [];
      if (replacements.length) {
        const previous = await client.query('SELECT storage_ref FROM visit_highlight_images WHERE highlight_id=$1', [req.params.id]);
        previousRefs = previous.rows.map((row) => row.storage_ref);
        await client.query('DELETE FROM visit_highlight_images WHERE highlight_id=$1', [req.params.id]);
        for (let n = 0; n < replacements.length; n++) {
          await client.query('INSERT INTO visit_highlight_images(highlight_id,storage_ref,sort_order) VALUES($1,$2,$3)',
            [req.params.id, replacements[n], n]);
        }
      }
      const updated = await client.query(
        `UPDATE visit_highlights SET caption=$3,category=$4,status='approved',moderation_reason=NULL,moderated_by=NULL,moderated_at=NULL
         WHERE id=$1 AND customer_id=$2 RETURNING id,status`, [req.params.id, req.user.id, caption, category]
      );
      return { row: updated.rows[0], previousRefs };
    });
    await Promise.allSettled(result.previousRefs.map(images.remove));
    res.json({ success: true, message: 'Gallery photo updated.', data: result.row });
  } catch (error) {
    await Promise.allSettled(replacements.map(images.remove));
    throw error;
  }
});

const remove = asyncHandler(async (req, res) => {
  uuid(req.params.id);
  const refs = await withTransaction(async (client) => {
    const owned = await client.query('SELECT id FROM visit_highlights WHERE id=$1 AND customer_id=$2 FOR UPDATE', [req.params.id, req.user.id]);
    if (!owned.rows.length) return null;
    const files = await client.query('SELECT storage_ref FROM visit_highlight_images WHERE highlight_id=$1', [req.params.id]);
    await client.query('DELETE FROM visit_highlights WHERE id=$1', [req.params.id]);
    return files.rows.map(row => row.storage_ref);
  });
  if (!refs) throw ApiError.notFound('Highlight not found or not yours');
  await Promise.allSettled(refs.map(images.remove));
  res.json({ success: true, message: 'Highlight deleted.' });
});

const moderate = asyncHandler(async (req, res) => {
  uuid(req.params.id);
  const { status } = req.body;
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
  if (!['approved', 'rejected', 'removed'].includes(status)) throw ApiError.badRequest('Invalid moderation decision.');
  if (status !== 'approved' && (reason.length < 5 || reason.length > 500)) throw ApiError.badRequest('Provide a reason of 5 to 500 characters.');
  const updated = await query(
    'UPDATE visit_highlights SET status=$2,moderation_reason=$3,moderated_by=$4,moderated_at=now() WHERE id=$1 RETURNING id,status',
    [req.params.id, status, reason || null, req.user.id]
  );
  if (!updated.rows.length) throw ApiError.notFound('Highlight not found');
  res.json({ success: true, message: `Highlight ${status}.`, data: updated.rows[0] });
});

const image = asyncHandler(async (req, res) => {
  uuid(req.params.imageId);
  const result = await query(
    `SELECT i.storage_ref,h.status,h.customer_id,r.owner_id,r.status AS restaurant_status,r.is_active
     FROM visit_highlight_images i JOIN visit_highlights h ON h.id=i.highlight_id
     JOIN restaurants r ON r.id=h.restaurant_id WHERE i.id=$1`, [req.params.imageId]
  );
  const item = result.rows[0];
  if (!item) throw ApiError.notFound('Image unavailable');
  const publicAccess = item.status === 'approved' && item.restaurant_status === 'verified' && item.is_active;
  const privateAccess = req.user && (req.user.role === 'admin' || req.user.id === item.customer_id || req.user.id === item.owner_id);
  if (!publicAccess && !privateAccess) throw ApiError.notFound('Image unavailable');
  const file = await images.open(item.storage_ref);
  res.set({ 'Content-Type': file.contentType, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
  file.stream.on('error', () => { if (!res.headersSent) res.status(404); res.end(); });
  file.stream.pipe(res);
});

module.exports = { publicList, mine, ownerList, adminList, create, update, remove, moderate, image };
