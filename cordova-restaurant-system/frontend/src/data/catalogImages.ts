import imageMap from './catalogImageMap.json';
import dishFallbacks from './dishPhotoFallbacks.json';
import coverFallbacks from './restaurantCoverFallbacks.json';

const mirrored = imageMap as Record<string, string>;
const representative = dishFallbacks as Record<string, string>;
const coverRepresentative = coverFallbacks as Record<string, string>;

/** Prefer a packaged photo when an older database row still has a remote or upload URL. */
export function catalogImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  return mirrored[url] || url;
}

export function catalogDishPhoto(id: string, url?: string | null): { image?: string; representative: boolean } {
  const fallback = representative[id];
  return fallback ? { image: fallback, representative: true }
    : { image: catalogImage(url), representative: false };
}

export function catalogRestaurantCover(slug: string, url?: string | null): string | undefined {
  if (url && (url.startsWith('/images/') || mirrored[url])) return catalogImage(url);
  return coverRepresentative[slug] || catalogImage(url);
}
