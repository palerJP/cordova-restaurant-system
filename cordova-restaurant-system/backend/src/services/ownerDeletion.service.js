const { withTransaction } = require('../config/db');
const ApiError = require('../utils/apiError');

async function deleteOwnedRestaurant(id, ownerId, confirmationName) {
  try {
    return await withTransaction(async (client) => {
      // Reservation writes lock this same row to prevent concurrent bookings.
      const { rows } = await client.query('SELECT * FROM restaurants WHERE id=$1 FOR UPDATE', [id]);
      const restaurant = rows[0];
      if (!restaurant) throw ApiError.notFound('Establishment not found');
      if (restaurant.owner_id !== ownerId) throw ApiError.forbidden('You do not own this establishment');
      if (typeof confirmationName !== 'string' || confirmationName.trim() !== restaurant.name.trim()) {
        throw ApiError.badRequest('Type the establishment name exactly to confirm deletion.');
      }
      const bookings = await client.query(`SELECT 1 FROM restaurant_reservations
        WHERE restaurant_id=$1 AND status IN ('pending','confirmed') AND ends_at>now() LIMIT 1`, [id]);
      if (bookings.rows.length) throw ApiError.conflict('Resolve upcoming pending requests and confirmed reservations before deleting this establishment.');
      await client.query('DELETE FROM restaurants WHERE id=$1 AND owner_id=$2', [id, ownerId]);
      return restaurant;
    });
  } catch (error) {
    if (error.code === '23503') throw ApiError.conflict('This establishment has protected records, such as ownership claims. Contact an administrator to remove it.');
    throw error;
  }
}
module.exports = { deleteOwnedRestaurant };
