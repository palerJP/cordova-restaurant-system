const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const RESTAURANTS_TS_PATH = path.resolve(__dirname, '../../../frontend/src/data/restaurants.ts');

const DEFAULT_CATEGORY_IMAGES = {
  'Cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=85',
  'Fast Food': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=1000&auto=format&fit=crop&q=85',
  'Street Food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=85',
  'Resto Bar': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1000&auto=format&fit=crop&q=85',
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&auto=format&fit=crop&q=85',
  'Restaurant': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000&auto=format&fit=crop&q=85',
  'BBQ': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000&auto=format&fit=crop&q=85',
  'Seafood': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1000&auto=format&fit=crop&q=85',
};

function inferCategory(name = '', description = '', cuisines = []) {
  const text = `${name} ${description} ${Array.isArray(cuisines) ? cuisines.join(' ') : ''}`.toLowerCase();
  if (text.includes('cafe') || text.includes('café') || text.includes('coffee') || text.includes('macchiato') || text.includes('milktea') || text.includes('tea')) return 'Cafe';
  if (text.includes('fast food') || text.includes('burger') || text.includes('fries')) return 'Fast Food';
  if (text.includes('street food') || text.includes('food park') || text.includes('tambayan')) return 'Street Food';
  if (text.includes('resto bar') || text.includes('bar and grill') || text.includes('restobar')) return 'Resto Bar';
  if (text.includes('pizza') || text.includes('pasta')) return 'Pizza';
  return 'Restaurant';
}

function getDefaultCoverImage(name = '', description = '', category = 'Restaurant') {
  const text = `${name} ${description}`.toLowerCase();
  if (text.includes('bbq') || text.includes('grill') || text.includes('barbecue') || text.includes('inasal')) {
    return DEFAULT_CATEGORY_IMAGES['BBQ'];
  }
  if (text.includes('seafood') || text.includes('bakasi') || text.includes('fish') || text.includes('shrimp') || text.includes('crab')) {
    return DEFAULT_CATEGORY_IMAGES['Seafood'];
  }
  return DEFAULT_CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGES['Restaurant'];
}

function normalizeKey(str = '') {
  return (str || '').toLowerCase().replace(/[\s\-_]/g, '');
}

function syncToRestaurantTs(restaurant) {
  try {
    if (!fs.existsSync(RESTAURANTS_TS_PATH)) {
      logger.warn(`restaurants.ts not found at ${RESTAURANTS_TS_PATH}`);
      return false;
    }

    let content = fs.readFileSync(RESTAURANTS_TS_PATH, 'utf8');
    const rawSlug = restaurant.slug || restaurant.id;
    const name = restaurant.name || 'Restaurant';
    const category = inferCategory(name, restaurant.description, restaurant.cuisines);
    let coverImage = restaurant.cover_image_url || restaurant.coverImageUrl || '';
    if (!coverImage || coverImage.trim() === '') {
      coverImage = getDefaultCoverImage(name, restaurant.description, category);
    }

    const barangay = restaurant.barangay || 'Cordova';
    const description = (restaurant.description || `Welcome to ${name} in Cordova, Cebu.`).replace(/'/g, "\\'");
    const address = (restaurant.address || '').replace(/'/g, "\\'");
    const phone = (restaurant.phone || '').replace(/'/g, "\\'");

    const normSlug = normalizeKey(rawSlug);
    const normName = normalizeKey(name);

    // Look for existing key in RESTAURANT_CUSTOMIZATIONS
    const entryBlockRegex = /^\s*['"]([^'"]+)['"]\s*:\s*\{[\s\S]*?^\s*\},?/gm;
    let match;
    let foundKey = null;
    let fullMatchedBlock = null;

    while ((match = entryBlockRegex.exec(content)) !== null) {
      const key = match[1];
      const normKey = normalizeKey(key);
      if (
        normKey === normSlug ||
        normKey === normName ||
        (normSlug && normKey.includes(normSlug)) ||
        (normKey && normSlug.includes(normKey)) ||
        (normName && normKey.includes(normName)) ||
        (normKey && normName.includes(normKey))
      ) {
        foundKey = key;
        fullMatchedBlock = match[0];
        break;
      }
    }

    const useKey = foundKey || rawSlug;
    const latitude = Number(restaurant.latitude);
    const longitude = Number(restaurant.longitude);
    const hasCoordinates =
      restaurant.latitude !== null && restaurant.latitude !== undefined && restaurant.latitude !== '' &&
      restaurant.longitude !== null && restaurant.longitude !== undefined && restaurant.longitude !== '' &&
      Number.isFinite(latitude) && Number.isFinite(longitude) &&
      latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    const latField = hasCoordinates ? `\n    latitude: ${latitude},` : '';
    const lngField = hasCoordinates ? `\n    longitude: ${longitude},` : '';
    const replacementEntry = `  '${useKey}': {\n    name: '${name.replace(/'/g, "\\'")}',\n    category: '${category}',\n    coverImage: '${coverImage}',\n    barangay: '${barangay.replace(/'/g, "\\'")}',\n    description: '${description}',\n    address: '${address}',\n    phone: '${phone}',${latField}${lngField}\n  },`;

    if (foundKey && fullMatchedBlock) {
      content = content.replace(fullMatchedBlock, replacementEntry);
      logger.info(`Updated existing entry for ${name} [${foundKey}] in restaurants.ts without duplicating.`);
    } else {
      // Append right before the closing of RESTAURANT_CUSTOMIZATIONS
      const closeMatch = /\n\};\s*\n\s*export function/m;
      if (closeMatch.test(content)) {
        content = content.replace(closeMatch, `\n\n  // ${name}\n${replacementEntry}\n};\n\nexport function`);
      } else {
        const lastIndex = content.lastIndexOf('};');
        if (lastIndex !== -1) {
          content = content.slice(0, lastIndex) + `\n  // ${name}\n${replacementEntry}\n` + content.slice(lastIndex);
        }
      }
      logger.info(`Added new entry for ${name} [${rawSlug}] to restaurants.ts`);
    }

    fs.writeFileSync(RESTAURANTS_TS_PATH, content, 'utf8');
    return true;
  } catch (err) {
    logger.error('Failed to sync restaurant to restaurants.ts', { error: err.message });
    return false;
  }
}

function removeFromRestaurantTs(restaurant) {
  try {
    if (!fs.existsSync(RESTAURANTS_TS_PATH)) {
      logger.warn(`restaurants.ts not found at ${RESTAURANTS_TS_PATH}`);
      return false;
    }

    let content = fs.readFileSync(RESTAURANTS_TS_PATH, 'utf8');
    const rawSlug = restaurant?.slug || restaurant?.id || '';
    const name = restaurant?.name || '';

    const normSlug = normalizeKey(rawSlug);
    const normName = normalizeKey(name);

    if (!normSlug && !normName) return false;

    // Matches optional comment and entry block in RESTAURANT_CUSTOMIZATIONS
    const entryBlockRegex = /(?:\r?\n\s*\/\/[^\r\n]*\r?\n)?\s*['"]([^'"]+)['"]\s*:\s*\{[\s\S]*?^\s*\},?/gm;
    let match;
    let fullMatchedBlock = null;

    while ((match = entryBlockRegex.exec(content)) !== null) {
      const key = match[1];
      const normKey = normalizeKey(key);
      if (
        (normSlug && normKey === normSlug) ||
        (normName && normKey === normName) ||
        (normSlug && (normKey.includes(normSlug) || normSlug.includes(normKey))) ||
        (normName && (normKey.includes(normName) || normName.includes(normKey)))
      ) {
        fullMatchedBlock = match[0];
        break;
      }
    }

    if (fullMatchedBlock) {
      content = content.replace(fullMatchedBlock, '');
      fs.writeFileSync(RESTAURANTS_TS_PATH, content, 'utf8');
      logger.info(`Removed entry for ${name || rawSlug} from restaurants.ts`);
      return true;
    }
    return false;
  } catch (err) {
    logger.error('Failed to remove restaurant from restaurants.ts', { error: err.message });
    return false;
  }
}

module.exports = { syncToRestaurantTs, removeFromRestaurantTs, inferCategory, getDefaultCoverImage };
