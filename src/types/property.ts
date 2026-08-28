import type { ImageSource } from 'expo-image';

import type { LocalityInfo } from '@/types/locality';

export type PropertyBadgeVariant = 'filling-fast' | 'gender';

export type PropertyBadge = {
  label: string;
  variant: PropertyBadgeVariant;
};

export type PropertyListing = {
  id: string;
  name: string;
  /** API `name` used for website HDP slugs (`name` preferred over `display_name`). */
  slugName?: string;
  location: string;
  city?: string;
  locality?: string;
  rating: number;
  /** Present when vibes filter is applied; omit/0 hides the card bar. */
  vibeMatchPercent?: number;
  startingRent: number;
  roomTypes: string[];
  images: ImageSource[];
  badges?: PropertyBadge[];
};

export type ApiProperty = {
  id: number | string;
  name?: string;
  display_name?: string;
  image?: string;
  images?: string[];
  property_image?: string[];
  rating?: number;
  google_rating?: number;
  price?: number;
  starting_rent?: number;
  min_rent?: number;
  vibe_match?: number | null;
  vibeMatch?: number | null;
  /** List API score when vibes filter is applied. */
  vibe_match_score?: number | null;
  gender?: string;
  tags?: string[];
  room_types?: string[];
  sharing_types?: string[];
  address?: {
    line1?: string;
    line2?: string;
    locality?: string;
    city?: string;
  };
  city?: string;
  locality?: string;
  is_filling_fast?: boolean;
  filling_fast?: boolean;
};

export type PropertyListPayload = {
  city: string;
  localityName?: string;
  filter?: {
    price?: { minPrice?: number; maxPrice?: number };
    gender?: string;
    food?: boolean;
    amenities?: string[];
    /** Selected vibe API ids for ranking / matching. */
    vibes?: number[];
  };
  sorting?: {
    keyType?: string;
    sortType?: string;
  } | null;
};

export type PropertyListPageInfo = {
  total?: number;
  count?: number;
  page?: number;
  pageSize?: number;
  nextPage?: number | boolean | null;
};

export type PropertyListResponse = {
  success: boolean;
  data?: ApiProperty[];
  pageInfo?: PropertyListPageInfo;
  nearBy?: ApiProperty[];
  localityInfo?: LocalityInfo | null;
  message?: string;
};

export type HdpGoogleReview = {
  name?: string;
  review?: string;
  star?: number | string;
};

export type HdpGoogleData = {
  google_rating?: number | string;
  google_link?: string;
  google_reviews?: unknown[];
  google_reviews_new?: HdpGoogleReview[];
  data?: Record<string, unknown>;
};

export type PropertyDetailResponse = {
  success: boolean;
  data?: Record<string, unknown>;
  googleData?: HdpGoogleData | null;
  events?: unknown[];
  /** Curated property moments (image/video) from `v2/hello/house`. */
  moments?: unknown[];
  /** Property gallery media (images + property videos) from `v2/hello/house`. */
  media?: unknown[];
  /** Overall match % when `vibes` were sent to the house API. */
  vibeMatchScore?: number | null;
  /** Per-selected-vibe match cards. */
  vibeBadges?: {
    vibeId?: number | string;
    vibeScore?: number | string;
  }[];
  /** Resident interests at the property. */
  propertyVibes?: {
    vibe_id?: number | string;
    code?: string;
    display_name?: string;
    count?: number;
    percentage?: number;
  }[];
  similarProperties?: ApiProperty[];
  similar_properties?: ApiProperty[];
  similar?: ApiProperty[];
  nearBy?: ApiProperty[];
  nearby?: ApiProperty[];
  near_by?: ApiProperty[];
  message?: string;
};

export type PropertyCategoriesResponse = {
  success: boolean;
  data?: Record<string, unknown>[];
  message?: string;
};

export type PropertyActionTarget = {
  propertyId: number;
  propertyName: string;
  location?: string;
  city?: string;
  startingRent?: number;
  imageUri?: string;
  propertyUrl?: string;
};
