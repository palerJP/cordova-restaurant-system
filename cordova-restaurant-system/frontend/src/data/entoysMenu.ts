import type { MenuCategory, MenuItem } from '@/lib/types';
import source from './entoysMenuSource.json';

const RESTAURANT_SLUG = 'entoys-bakasihan';

export const ENTOYS_CATEGORIES: MenuCategory[] = source.categories.map((category, index) => ({
  id: `mc-entoys-source-${String(index + 1).padStart(2, '0')}`,
  restaurant_id: RESTAURANT_SLUG,
  name: category.name,
  sort_order: category.sortOrder,
}));

const categoryIds = new Map(ENTOYS_CATEGORIES.map((category) => [category.name, category.id]));

export const ENTOYS_MENU_ITEMS: MenuItem[] = source.items.map((item, index) => ({
  id: `mi-entoys-source-${String(index + 1).padStart(3, '0')}`,
  restaurant_id: RESTAURANT_SLUG,
  category_id: categoryIds.get(item.category),
  category_name: item.category,
  name: item.name,
  description: item.description,
  price: item.price,
  price_label: item.priceLabel,
  image_url: item.imageUrl,
  is_available: true,
  dietary_tags: [],
}));
