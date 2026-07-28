const { query } = require('../config/db');

async function listAll() {
  const { rows } = await query(`SELECT * FROM cuisines ORDER BY name`);
  return rows;
}

async function findBySlugs(slugs) {
  const { rows } = await query(`SELECT * FROM cuisines WHERE slug = ANY($1)`, [slugs]);
  return rows;
}

async function create({ name, slug }) {
  const { rows } = await query(
    `INSERT INTO cuisines (name, slug) VALUES ($1,$2) RETURNING *`,
    [name, slug]
  );
  return rows[0];
}

module.exports = { listAll, findBySlugs, create };
