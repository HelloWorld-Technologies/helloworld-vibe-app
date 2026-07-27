import { COMING_SOON_IMAGE_URI, formatPropertyImageUrl, getPropertyImageKeys } from '@/utils/images';
import type { HdpApiMediaItem, HdpHeroSlide, HdpHeroTabId } from '@/types/hdp-media';
import type { HdpMomentItem } from '@/types/hdp-moments';

function isMediaItem(value: unknown): value is HdpApiMediaItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as HdpApiMediaItem;
  return typeof item.url === 'string' && item.url.trim().length > 0;
}

function sortByDisplayOrder<T extends { display_order?: number | null }>(items: T[]) {
  return [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

export function extractPropertyVideos(media: unknown): HdpHeroSlide[] {
  if (!Array.isArray(media)) return [];

  return sortByDisplayOrder(media.filter(isMediaItem))
    .filter((item) => item.media_type?.toLowerCase() === 'video')
    .map((item, index) => {
      const url = item.url!.trim();
      const thumb = item.thumbnail_url?.trim();
      return {
        id: String(item.id ?? `property-video-${index}`),
        mediaType: 'video' as const,
        imageUri: thumb ? formatPropertyImageUrl(thumb, 'hdp') : COMING_SOON_IMAGE_URI,
        mediaUrl: url,
        label: item.tag?.trim() || 'Property Video',
      };
    });
}

export function extractPropertyPhotos(
  media: unknown,
  property?: Record<string, unknown> | null,
  routeImage?: string,
): HdpHeroSlide[] {
  if (Array.isArray(media)) {
    const images = sortByDisplayOrder(media.filter(isMediaItem)).filter(
      (item) => item.media_type?.toLowerCase() !== 'video',
    );

    const hdpPreferred = images.filter((item) => item.is_hdp);
    const source = hdpPreferred.length > 0 ? hdpPreferred : images;

    if (source.length > 0) {
      return source.map((item, index) => ({
        id: String(item.id ?? `photo-${index}`),
        mediaType: 'image' as const,
        imageUri: formatPropertyImageUrl(item.url, 'hdp'),
        mediaUrl: formatPropertyImageUrl(item.url, 'hdp'),
        label: item.tag?.trim() || undefined,
      }));
    }
  }

  const imageKeys = getPropertyImageKeys(property);
  if (imageKeys.length > 0) {
    return imageKeys.map((key, index) => ({
      id: `legacy-photo-${index}`,
      mediaType: 'image' as const,
      imageUri: formatPropertyImageUrl(key, 'hdp'),
      mediaUrl: formatPropertyImageUrl(key, 'hdp'),
    }));
  }

  if (routeImage) {
    return [
      {
        id: 'route-photo',
        mediaType: 'image',
        imageUri: routeImage,
        mediaUrl: routeImage,
      },
    ];
  }

  return [];
}

export function momentsToHeroSlides(moments: HdpMomentItem[]): HdpHeroSlide[] {
  return moments.map((moment) => ({
    id: `moment-${moment.id}`,
    mediaType: moment.mediaType,
    imageUri: moment.imageUri,
    mediaUrl: moment.mediaUrl,
    label: moment.label,
  }));
}

export function buildHeroTabs(input: {
  propertyVideos: HdpHeroSlide[];
  moments: HdpHeroSlide[];
  photos: HdpHeroSlide[];
}): { id: HdpHeroTabId; label: string }[] {
  const tabs: { id: HdpHeroTabId; label: string }[] = [];
  if (input.propertyVideos.length > 0) {
    tabs.push({ id: 'property-video', label: 'Property Video' });
  }
  if (input.moments.length > 0) {
    tabs.push({ id: 'moments', label: 'Moments' });
  }
  if (input.photos.length > 0) {
    tabs.push({ id: 'photos', label: 'Photos' });
  }
  return tabs;
}

export function slidesForHeroTab(
  tab: HdpHeroTabId,
  buckets: {
    propertyVideos: HdpHeroSlide[];
    moments: HdpHeroSlide[];
    photos: HdpHeroSlide[];
  },
): HdpHeroSlide[] {
  if (tab === 'property-video') return buckets.propertyVideos;
  if (tab === 'moments') return buckets.moments;
  return buckets.photos;
}
