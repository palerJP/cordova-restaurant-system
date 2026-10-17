require('dotenv').config();
const { query } = require('../config/db');

async function run() {
  if (require('../config/env').isProduction) throw new Error('Sample subscriptions are disabled in production.');
  await query(`UPDATE restaurants SET subscription_tier = 'featured', subscription_expires_at = NOW() + INTERVAL '30 days' WHERE slug = 'lantaw-floating-native-restaurant'`);
  await query(`UPDATE restaurants SET subscription_tier = 'featured', subscription_expires_at = NOW() + INTERVAL '30 days' WHERE slug = 'solea-mactan-restaurant' OR slug = 'solea-mactan-resort'`);
  await query(`UPDATE restaurants SET subscription_tier = 'premium', subscription_expires_at = NOW() + INTERVAL '30 days' WHERE slug = 'parola-seaview-restaurant'`);
  await query(`UPDATE restaurants SET subscription_tier = 'basic', subscription_expires_at = NOW() + INTERVAL '30 days' WHERE slug = '10000-roses-cafe-and-more'`);
  console.log('Sample subscriptions set successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed to set sample subscriptions:', err);
  process.exit(1);
});
