import imageMap from './catalogImageMap.json';
import dishFallbacks from './dishPhotoFallbacks.json';
import coverFallbacks from './restaurantCoverFallbacks.json';
import photoIndex from './catalogPhotoIndex.json';

const mirrored = imageMap as Record<string, string>;
const representative = dishFallbacks as Record<string, string>;
const coverRepresentative = coverFallbacks as Record<string, string>;
const indexedPhotos = photoIndex as {
  covers: Record<string, string>;
  byRestaurantCategory: Record<string, string>;
  byCategoryAndName: Record<string, { image: string; representative: boolean }>;
  byName: Record<string, { image: string; representative: boolean }>;
};
const key = (value?: string | null) => (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
const legacyPhoto = (url: string) => /^https:\/\/(images\.deliveryhero\.io|encrypted-tbn\d*\.gstatic\.com)\//i.test(url);

/** Prefer a packaged photo when an older database row still has a remote or upload URL. */
export function catalogImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  return mirrored[url] || url;
}

export function catalogDishPhoto(
  slug: string,
  category: string,
  name: string,
  id: string,
  url?: string | null,
): { image?: string; fallback?: string; representative: boolean } {
  // Database IDs differ between local and production, so use the establishment
  // and dish names to find a packaged photo when the ID or URL mapping misses.
  const slugKey = key(slug);
  const indexed = indexedPhotos.byCategoryAndName[`${slugKey}|${key(category)}|${key(name)}`]
    || indexedPhotos.byName[`${slugKey}|${key(name)}`];
  const packaged = representative[id] || indexed?.image;
  const mapped = url ? mirrored[url] : undefined;
  const image = mapped || (url?.startsWith('/images/') ? url : undefined)
    || (url && (!legacyPhoto(url) || !packaged) ? url : undefined)
    || packaged;
  return {
    image,
    fallback: packaged && packaged !== image ? packaged
      : undefined,
    representative: image === packaged ? Boolean(representative[id] || indexed?.representative)
      : false,
  };
}

export function catalogRestaurantCover(slug: string, url?: string | null): string | undefined {
  if (url && (url.startsWith('/images/') || mirrored[url])) return catalogImage(url);
  if (url && !legacyPhoto(url)) return url;
  return indexedPhotos.covers[key(slug)] || coverRepresentative[slug] || catalogImage(url);
}
