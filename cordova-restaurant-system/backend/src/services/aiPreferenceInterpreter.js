const CUISINE_INTENTS = [
  { value: 'Bakasi & Shellfish', aliases: ['bakasi', 'reef eel', 'nilarang', 'linarang'] },
  { value: 'Seafood', aliases: ['seafood', 'fish', 'shrimp', 'prawn', 'squid', 'scallop', 'crab', 'calamares'] },
  { value: 'Grill & BBQ', aliases: ['bbq', 'barbecue', 'grill', 'grilled', 'inasal', 'skewers'] },
  { value: 'Cebuano / Local', aliases: ['cebuano', 'local food', 'cordova food', 'pinoy'] },
  { value: 'Filipino', aliases: ['filipino', 'philippine food'] },
  { value: 'Cafe', aliases: ['cafe', 'coffee', 'espresso', 'latte', 'cappuccino', 'matcha'] },
  { value: 'Pizza & Pasta', aliases: ['pizza', 'pasta', 'italian'] },
  { value: 'Desserts & Milktea', aliases: ['dessert', 'desserts', 'sweet', 'milk tea', 'milktea', 'boba'] },
  { value: 'Fast Food', aliases: ['fast food', 'burger', 'burgers', 'fries'] },
  { value: 'Street Food', aliases: ['street food', 'street snacks'] },
];

const DIETARY_INTENTS = [
  { value: 'HALAL', aliases: ['halal'] },
  { value: 'Vegan', aliases: ['vegan'] },
  { value: 'Vegetarian', aliases: ['vegetarian', 'veggie'] },
  { value: 'No Pork', aliases: ['no pork', 'without pork', 'pork free', 'pork-free'] },
  { value: 'Gluten-Free', aliases: ['gluten free', 'gluten-free', 'celiac'] },
];

const SERVICE_INTENTS = [
  { value: 'Seaside / Sunset View', aliases: ['seaside', 'by the sea', 'ocean view', 'waterfront', 'sunset', 'seaview'] },
  { value: 'Outdoor / Al Fresco', aliases: ['outdoor', 'al fresco', 'alfresco', 'open air'] },
  { value: 'Live Music', aliases: ['live music', 'live band', 'band'] },
  { value: 'Air Conditioned', aliases: ['air conditioned', 'airconditioned', 'aircon', 'ac'] },
  { value: 'Dine-In', aliases: ['dine in', 'dine-in', 'sit down', 'eat in'] },
  { value: 'Takeout', aliases: ['takeout', 'take out', 'take-away', 'takeaway'] },
  { value: 'Delivery', aliases: ['delivery', 'deliver to me', 'deliver'] },
];

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9₱.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsPhrase(text, phrase) {
  const normalizedPhrase = normalize(phrase);
  return normalizedPhrase.length > 0 && ` ${text} `.includes(` ${normalizedPhrase} `);
}

function findIntentValues(text, intents) {
  return intents
    .filter((intent) => intent.aliases.some((alias) => containsPhrase(text, alias)))
    .map((intent) => intent.value);
}

function inferBudgetRange(text) {
  const amountMatch = text.match(/(?:under|below|less than|up to|maximum|max)\s*(?:₱|php|p)?\s*([\d,]+)(?!\s*km)/)
    || text.match(/(?:₱|php)\s*([\d,]+)/);

  if (amountMatch) {
    const amount = Number(amountMatch[1].replace(/,/g, ''));
    if (Number.isFinite(amount)) {
      if (amount <= 250) return 'budget';
      if (amount <= 600) return 'moderate';
      if (amount <= 1500) return 'expensive';
      return 'premium';
    }
  }

  if (['budget', 'cheap', 'affordable', 'sulit'].some((term) => containsPhrase(text, term))) return 'budget';
  if (['moderate', 'midrange', 'mid range'].some((term) => containsPhrase(text, term))) return 'moderate';
  if (['premium', 'luxury', 'high end'].some((term) => containsPhrase(text, term))) return 'premium';
  if (['expensive', 'upscale'].some((term) => containsPhrase(text, term))) return 'expensive';
  return null;
}

function interpretQuery(query) {
  const text = normalize(query);
  const preferredCuisines = findIntentValues(text, CUISINE_INTENTS);
  const dietaryRestrictions = findIntentValues(text, DIETARY_INTENTS);
  const requiredServices = findIntentValues(text, SERVICE_INTENTS);
  const budgetRange = inferBudgetRange(text);
  const distanceMatch = text.match(/(?:within|under|less than)\s*([\d.]+)\s*(?:km|kilometers?)/);
  const maxDistanceKm = distanceMatch ? Number(distanceMatch[1]) : null;
  const onlyOpenNow = ['open now', 'currently open', 'open right now'].some((term) => containsPhrase(text, term));

  const summary = [
    ...preferredCuisines,
    ...dietaryRestrictions,
    ...requiredServices,
    ...(budgetRange ? [`${budgetRange[0].toUpperCase()}${budgetRange.slice(1)} budget`] : []),
    ...(maxDistanceKm && Number.isFinite(maxDistanceKm) ? [`within ${maxDistanceKm} km`] : []),
    ...(onlyOpenNow ? ['open now'] : []),
  ];

  return {
    filterCuisines: preferredCuisines,
    filterServices: requiredServices,
    preferredCuisines,
    dietaryRestrictions,
    requiredServices,
    budgetRange,
    maxDistanceKm: Number.isFinite(maxDistanceKm) ? maxDistanceKm : null,
    onlyOpenNow,
    summary,
  };
}

module.exports = {
  interpretQuery,
  intentOptions: {
    cuisines: CUISINE_INTENTS.map((intent) => intent.value),
    dietaryRestrictions: DIETARY_INTENTS.map((intent) => intent.value),
    requiredServices: SERVICE_INTENTS.map((intent) => intent.value),
  },
};
