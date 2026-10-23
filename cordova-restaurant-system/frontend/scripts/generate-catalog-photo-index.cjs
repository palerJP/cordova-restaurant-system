const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'database/catalog.snapshot.json'), 'utf8'));
const publicRoot = path.join(root, 'frontend/public');
const output = path.join(root, 'frontend/src/data/catalogPhotoIndex.json');
const key = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const restaurants = new Map(snapshot.restaurants.map((restaurant) => [restaurant.id, restaurant]));
const categories = new Map(snapshot.categories.map((category) => [category.id, category.name]));
const covers = {};
const byRestaurantCategory = {};
const byCategoryAndName = {};
const byName = {};
const nameCandidates = new Map();

function assertLocalPhoto(reference) {
  if (!reference?.startsWith('/images/') || !fs.existsSync(path.join(publicRoot, reference.slice(1)))) {
    throw new Error(`Catalog photo is not packaged: ${reference}`);
  }
}

for (const restaurant of snapshot.restaurants) {
  if (restaurant.cover_image_url?.startsWith('/images/')) {
    assertLocalPhoto(restaurant.cover_image_url);
    covers[key(restaurant.slug)] = restaurant.cover_image_url;
  }
}

for (const dish of snapshot.dishes) {
  const restaurant = restaurants.get(dish.restaurant_id);
  if (!restaurant) throw new Error(`Missing restaurant for dish ${dish.id}`);
  assertLocalPhoto(dish.image_url);
  const slug = key(restaurant.slug);
  const dishName = key(dish.name);
  const categoryName = key(categories.get(dish.category_id));
  const photo = { image: dish.image_url, representative: Boolean(dish.representative_photo) };
  byRestaurantCategory[`${slug}|${categoryName}`] ||= dish.image_url;
  byCategoryAndName[`${slug}|${categoryName}|${dishName}`] = photo;
  const nameKey = `${slug}|${dishName}`;
  const candidates = nameCandidates.get(nameKey) || [];
  candidates.push(photo);
  nameCandidates.set(nameKey, candidates);
}

for (const [nameKey, photos] of nameCandidates) {
  if (photos.every((photo) => photo.image === photos[0].image)) byName[nameKey] = photos[0];
}

const sorted = (entries) => Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(output, `${JSON.stringify({
  covers: sorted(covers),
  byRestaurantCategory: sorted(byRestaurantCategory),
  byCategoryAndName: sorted(byCategoryAndName),
  byName: sorted(byName),
})}\n`);
console.log(`Indexed ${snapshot.dishes.length} packaged dish photos across ${snapshot.restaurants.length} establishments.`);
