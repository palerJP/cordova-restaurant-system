import type { MenuCategory, MenuItem } from '@/lib/types';
import menu from './burandatMenu.json';

const RESTAURANT_ID = 'burandat-seafood-bucket';

type Product = {
  category: string;
  name: string;
  price: number;
  image_url: string;
  unit?: string;
  description?: string;
};

const products: Product[] = menu.items;
const categoryId = (name: string) => `cat-burandat-${name.toLowerCase()}`;

export const BURANDAT_CATEGORIES: MenuCategory[] = menu.categories.map((category) => ({
  id: categoryId(category.name),
  restaurant_id: RESTAURANT_ID,
  name: category.name,
  sort_order: category.sortOrder,
}));

export const BURANDAT_PRICE_UNITS = new Map(
  products.filter((product) => product.unit).map((product) => [product.name, product.unit!]),
);

export const BURANDAT_MENU_ITEMS: MenuItem[] = products.map((product, index) => ({
  id: `mi-burandat-${String(index + 1).padStart(2, '0')}`,
  restaurant_id: RESTAURANT_ID,
  category_id: categoryId(product.category),
  category_name: product.category,
  name: product.name,
  description: product.description || (product.unit ? `Price per ${product.unit}.` : ''),
  price: product.price,
  image_url: product.image_url,
  is_available: true,
  dietary_tags: [],
}));
