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

export const FEED_ITEMS = [
  { id: '1', caption: 'Hi guys,', image: 'loginBentoBedroomSmall' as const },
  { id: '2', caption: 'Room tour', image: 'loginBento1' as const },
] as const;

export {
  VIBE_CHIP_GRADIENT,
  VIBE_OPTIONS,
  type VibeId,
  type VibeOption,
} from '@/constants/vibes';

/** @deprecated Use `VIBE_OPTIONS` from `@/constants/vibes`. */
export { VIBE_OPTIONS as VIBE_TAGS } from '@/constants/vibes';
