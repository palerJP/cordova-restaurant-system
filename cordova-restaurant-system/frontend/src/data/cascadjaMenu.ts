import type { MenuCategory, MenuItem } from '@/lib/types';
import menu from './cascadjaMenu.json';

// CordovaEats currently lists the Foodpanda establishment under this spelling.
const RESTAURANT_ID = 'cascaja-cafe';

type Product = {
  category: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  startingPrice?: boolean;
  image_is_representative?: boolean;
  image_source_page?: string;
  image_credit?: string;
  image_license?: string;
};

const products: Product[] = menu.items;
const categoryId = (name: string) => `cat-cascadja-${name.toLowerCase().replace(/\s+/g, '-')}`;

export const CASCADJA_CATEGORIES: MenuCategory[] = menu.categories.map((category) => ({
  id: categoryId(category.name),
  restaurant_id: RESTAURANT_ID,
  name: category.name,
  sort_order: category.sortOrder,
}));

export const CASCADJA_REPRESENTATIVE_IMAGES = new Map(
  products
    .filter((product) => product.image_is_representative)
    .map((product) => [product.name, product.image_url]),
);

const LICENSE_URLS: Record<string, string> = {
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
};

export const CASCADJA_IMAGE_ATTRIBUTIONS = new Map(
  products
    .filter((product) => product.image_credit && product.image_license && product.image_source_page)
    .map((product) => [product.name, {
      imageUrl: product.image_url,
      credit: product.image_credit!,
      sourcePage: product.image_source_page!,
      license: product.image_license!,
      licenseUrl: LICENSE_URLS[product.image_license!] || product.image_source_page!,
    }]),
);

export const CASCADJA_MENU_ITEMS: MenuItem[] = products.map((product, index) => ({
  id: `mi-cascadja-${String(index + 1).padStart(2, '0')}`,
  restaurant_id: RESTAURANT_ID,
  category_id: categoryId(product.category),
  category_name: product.category,
  name: product.name,
  description: [
    product.startingPrice ? 'Starting price; final price depends on the selected option.' : '',
    product.description || '',
    product.image_is_representative ? 'Representative image.' : '',
  ].filter(Boolean).join(' '),
  price: product.price,
  image_url: product.image_url,
  is_available: true,
  dietary_tags: [],
}));
