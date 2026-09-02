import { Image } from 'expo-image';

/** URIs successfully displayed this session — avoids skeleton flash on list remount. */
const loadedUriCache = new Set<string>();

export function markImageUriLoaded(uri: string) {
  const trimmed = uri.trim();
  if (trimmed) loadedUriCache.add(trimmed);
}

export function isImageUriLoaded(uri: string): boolean {
  const trimmed = uri.trim();
  return trimmed.length > 0 && loadedUriCache.has(trimmed);
}

export async function probeImageDiskCache(uri: string): Promise<boolean> {
  const trimmed = uri.trim();
  if (!trimmed) return false;

  try {
    const path = await Image.getCachePathAsync(trimmed);
    if (path) {
      loadedUriCache.add(trimmed);
      return true;
    }
  } catch {
    // getCachePathAsync unavailable or cache miss — fall through.
  }
  return false;
}
