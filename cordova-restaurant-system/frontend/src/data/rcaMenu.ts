import type { MenuCategory, MenuItem } from '@/lib/types';

// Prices and product photos from the RCA Food Station Foodpanda listing, checked 2026-10-06.
// The two items marked "Starting price" have additional, unlabeled size options there.
const RESTAURANT_ID = 'rca-bilao-food-station';
const IMAGE_BASE = 'https://foodpanda.dhmedia.io/image/fd-ph/Products';

export const RCA_CATEGORIES: MenuCategory[] = [
  { id: 'cat-rca-lechon', restaurant_id: RESTAURANT_ID, name: 'RCA Lechon Belly', sort_order: 1 },
  { id: 'cat-rca-food-set', restaurant_id: RESTAURANT_ID, name: 'RCA Food Set', sort_order: 2 },
  { id: 'cat-rca-kakanin', restaurant_id: RESTAURANT_ID, name: 'RCA Kakanin', sort_order: 3 },
];

const products = [
  { categoryId: 'cat-rca-lechon', name: 'Lechon Belly', price: 2779, imageId: 72198320,
    description: 'Starting price; the final price depends on the selected raw weight.' },
  { categoryId: 'cat-rca-food-set', name: 'Round Bilao Set A', price: 1535, imageId: 72198321,
    description: 'Serves 6–8 with shrimp, lumpia, fried chicken, and bam-e.' },
  { categoryId: 'cat-rca-food-set', name: 'Round Bilao Set B', price: 2790, imageId: 72198322,
    description: 'Serves 8–10 with lechon belly, shrimp, lumpia, fried chicken, and bam-e.' },
  { categoryId: 'cat-rca-food-set', name: 'Budget A', price: 3060, imageId: 72198323,
    description: 'Serves 12–15 with shrimp, fish fillet, lumpia, calamares, and bam-e.' },
  { categoryId: 'cat-rca-food-set', name: 'Budget B', price: 3480, imageId: 72198324,
    description: 'Serves 12–15 with shrimp, fish fillet, cordon bleu, calamares, and scallops.' },
  { categoryId: 'cat-rca-food-set', name: 'Bilao Set A', price: 4180, imageId: 72198325,
    description: 'Serves 15 with lechon belly, shrimp, fried chicken, lumpia, and bam-e.' },
  { categoryId: 'cat-rca-food-set', name: 'Bilao Set B', price: 4180, imageId: 72227052,
    description: 'Serves 15 with lechon belly, shrimp, scallops, fish fillet, and bam-e.' },
  { categoryId: 'cat-rca-food-set', name: 'Seafood Bilao Set A', price: 2780, imageId: 72198326,
    description: 'Serves 8–10 with pompano, crab, calamares, scallops, and shrimp.' },
  { categoryId: 'cat-rca-food-set', name: 'Food Set A', price: 3755, imageId: 72198327,
    description: 'Serves 20 with bam-e, fried chicken, menudo, fish fillet, and shrimp.' },
  { categoryId: 'cat-rca-food-set', name: 'Food Set B', price: 3755, imageId: 72198328,
    description: 'Serves 20 with bihon, Korean-style fried chicken, humba, pinakbet, and fish fillet.' },
  { categoryId: 'cat-rca-food-set', name: 'Food Set C', price: 3755, imageId: 72198329,
    description: 'Serves 20 with spaghetti, fried chicken, pork steak, lumpia, and grilled bangus.' },
  { categoryId: 'cat-rca-food-set', name: 'Food Set D', price: 3755, imageId: 72198330,
    description: 'Serves 20 with bam-e, cordon bleu, bola-bola, lumpia, and calamares.' },
  { categoryId: 'cat-rca-food-set', name: 'Food Set E', price: 3755, imageId: 72198331,
    description: 'Serves 20 with bam-e, scallops, chop suey, lumpia, and shrimp.' },
  { categoryId: 'cat-rca-kakanin', name: 'RCA KAKANIN', price: 973, imageId: 72198332,
    description: 'Starting price; choose three kakanin varieties per bilao.' },
] as const;

export const RCA_MENU_ITEMS: MenuItem[] = products.map((product, index) => ({
  id: `mi-rca-${String(index + 1).padStart(2, '0')}`,
  restaurant_id: RESTAURANT_ID,
  category_id: product.categoryId,
  category_name: RCA_CATEGORIES.find((category) => category.id === product.categoryId)?.name,
  name: product.name,
  description: product.description,
  price: product.price,
  image_url: `${IMAGE_BASE}/${product.imageId}.jpg`,
  is_available: true,
  dietary_tags: [],
}));
