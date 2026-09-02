import palette from '@/constants/palette';

export const HOME_NEIGHBORHOOD_COUNT = 7;

/** Home hero background — linear gradient top → bottom per Figma. */
export const HOME_BACKGROUND_GRADIENT = {
  colors: [palette.homeGradientTop, palette.homeGradientBottom] as const,
  start: { x: 0, y: 0 } as const,
  end: { x: 0, y: 1 } as const,
};

export const NEIGHBORHOODS = [
  {
    id: 'electronic-city',
    name: 'Electronic City',
    price: '₹9,000',
    properties: 15,
    image: 'loginBento1' as const,
  },
  {
    id: 'hsr',
    name: 'HSR Layout',
    price: '₹11,000',
    properties: 22,
    image: 'loginBento2' as const,
  },
  {
    id: 'koramangala',
    name: 'Koramangala',
    price: '₹12,500',
    properties: 18,
    image: 'loginBento3' as const,
  },
] as const;

export const FEATURED_PROPERTY = {
  name: 'HelloWorld Mahaveer',
  rating: 4.5,
  location: 'Coliving PG in HSR Layout',
  roomType: 'Double - Triple',
  rent: '₹12,500',
  visitsToday: 7,
  gender: 'Men Only',
  image: 'loginBento4' as const,
} as const;

/** Compressed feed media — hw-production-compressed-image/insta-media on CDN. */
const INSTA_MEDIA_BASE = 'https://images.thehelloworld.com/insta-media/';

function feedPosterUrl(slug: string) {
  return `${INSTA_MEDIA_BASE}${slug}-poster.webp`;
}

function feedVideoUrl(slug: string) {
  return `${INSTA_MEDIA_BASE}${slug}.mp4`;
}

/** Static Explore feed — matches helloworld-vibe homepage (no API). */
export const HOME_FEED_MOMENTS = [
  {
    id: 'feed-01-unspoken-rules',
    label: 'Unspoken Rules',
    imageUri: feedPosterUrl('01-unspoken-rules'),
    mediaType: 'video' as const,
    mediaUrl: feedVideoUrl('01-unspoken-rules'),
  },
  {
    id: 'feed-02-tpl-kolkata',
    label: 'TPL Kolkata',
    imageUri: feedPosterUrl('02-tpl-kolkata'),
    mediaType: 'video' as const,
    mediaUrl: feedVideoUrl('02-tpl-kolkata'),
  },
  {
    id: 'feed-03-independence-day',
    label: 'Independence Day',
    imageUri: feedPosterUrl('03-independence-day'),
    mediaType: 'video' as const,
    mediaUrl: feedVideoUrl('03-independence-day'),
  },
  {
    id: 'feed-04-we-rated-each-other',
    label: 'We rated each other',
    imageUri: feedPosterUrl('04-we-rated-each-other'),
    mediaType: 'video' as const,
    mediaUrl: feedVideoUrl('04-we-rated-each-other'),
  },
  {
    id: 'feed-05-tenants-open-mic',
    label: 'Tenants Open Mic',
    imageUri: feedPosterUrl('05-tenants-open-mic'),
    mediaType: 'video' as const,
    mediaUrl: feedVideoUrl('05-tenants-open-mic'),
  },
] as const;

export {
  VIBE_CHIP_GRADIENT,
  VIBE_OPTIONS,
  type VibeId,
  type VibeOption,
} from '@/constants/vibes';

/** @deprecated Use `VIBE_OPTIONS` from `@/constants/vibes`. */
export { VIBE_OPTIONS as VIBE_TAGS } from '@/constants/vibes';
