import { COMING_SOON_IMAGE_URI, formatPropertyImageUrl, getPropertyImageKeys } from '@/utils/images';
import type { HdpApiMoment, HdpMomentItem, HdpMomentMediaType } from '@/types/hdp-moments';

const DEFAULT_MOMENT_LABELS = [
  'Community Lounge',
  'Private Room',
  'Shared Kitchen',
  'Work Zone',
  'Rooftop Hangout',
  'Game Room',
  'Fitness Corner',
  'Common Area',
] as const;

function isHdpApiMoment(value: unknown): value is HdpApiMoment {
  if (!value || typeof value !== 'object') return false;
  const moment = value as HdpApiMoment;
  return typeof moment.url === 'string' && moment.url.trim().length > 0;
}

function resolveMediaType(mediaType?: string, url?: string): HdpMomentMediaType {
  const normalized = mediaType?.trim().toLowerCase();
  if (normalized === 'video' || normalized === 'videos') return 'video';
  if (normalized === 'image' || normalized === 'images' || normalized === 'photo' || normalized === 'photos') {
    return 'image';
  }

  // Fallback when API omits media_type — infer from URL.
  const lowerUrl = url?.trim().toLowerCase() ?? '';
  if (/\.(mp4|mov|m4v|webm|mkv)(\?|$)/.test(lowerUrl) || lowerUrl.includes('/videos/')) {
    return 'video';
  }

  return 'image';
}

function resolveMomentLabel(moment: HdpApiMoment, _index: number): string {
  const caption = moment.caption?.trim();
  if (caption) return caption;

  const tag = Array.isArray(moment.tags)
    ? moment.tags.find((item) => typeof item === 'string' && item.trim().length > 0)?.trim()
    : undefined;
  if (tag) return tag;

  // Prefer empty over placeholder copy for feed/story captions.
  return '';
}

function resolvePreviewUri(moment: HdpApiMoment, mediaType: HdpMomentMediaType): string {
  const thumb = moment.thumbnail_url?.trim();
  const url = moment.url?.trim();

  if (mediaType === 'video') {
    if (thumb) return formatPropertyImageUrl(thumb, 'hdp');
    return COMING_SOON_IMAGE_URI;
  }

  // Image moments use the media URL as the preview.
  if (url) return formatPropertyImageUrl(url, 'hdp');
  if (thumb) return formatPropertyImageUrl(thumb, 'hdp');
  return COMING_SOON_IMAGE_URI;
}

export function mapApiMomentsToItems(moments: HdpApiMoment[]): HdpMomentItem[] {
  return [...moments]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((moment, index) => {
      const url = moment.url?.trim() || undefined;
      const mediaType = resolveMediaType(moment.media_type, url);
      return {
        id: String(moment.id ?? `${mediaType}-${index}`),
        label: resolveMomentLabel(moment, index),
        imageUri: resolvePreviewUri(moment, mediaType),
        mediaType,
        mediaUrl: url,
        propertyId:
          typeof moment.property_id === 'number' ? moment.property_id : undefined,
      };
    });
}

function mapApiMoments(moments: HdpApiMoment[]): HdpMomentItem[] {
  return mapApiMomentsToItems(moments);
}

function mapGalleryToMoments(property?: Record<string, unknown> | null): HdpMomentItem[] {
  const imageKeys = getPropertyImageKeys(property);
  const galleryKeys = imageKeys.length > 3 ? imageKeys.slice(1) : imageKeys;

  return galleryKeys.map((key, index) => ({
    id: `gallery-${index}`,
    label: DEFAULT_MOMENT_LABELS[index % DEFAULT_MOMENT_LABELS.length],
    imageUri: formatPropertyImageUrl(key, 'hdp'),
    mediaType: 'image' as const,
    mediaUrl: formatPropertyImageUrl(key, 'hdp'),
  }));
}

/**
 * Prefer `moments` from `v2/hello/house`. Optionally falls back to property gallery
 * images when the property has no curated moments yet.
 */
export function extractMomentsFromHdp(
  moments: unknown,
  property?: Record<string, unknown> | null,
  options?: { fallbackToGallery?: boolean },
): HdpMomentItem[] {
  if (Array.isArray(moments)) {
    const fromApi = mapApiMoments(moments.filter(isHdpApiMoment));
    if (fromApi.length > 0) {
      return fromApi;
    }
  }

  if (options?.fallbackToGallery === false) {
    return [];
  }

  return mapGalleryToMoments(property);
}
