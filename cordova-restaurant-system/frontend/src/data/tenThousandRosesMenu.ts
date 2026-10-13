import type { MenuItem, MenuCategory } from '@/lib/types';
import source from './tenThousandRosesMenuSource.json';

// Transcribed from branded menu photos dated 2026-02-21; provenance is in the source JSON.
export const TEN_THOUSAND_ROSES_CATEGORIES: MenuCategory[] = source.categories;
export const TEN_THOUSAND_ROSES_MENU_ITEMS: MenuItem[] = source.items;
