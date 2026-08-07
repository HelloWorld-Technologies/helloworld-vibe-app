import type { ImageSource } from 'expo-image';

export type PropertyBadgeVariant = 'filling-fast' | 'women-only';

export type PropertyBadge = {
  label: string;
  variant: PropertyBadgeVariant;
};

export type PropertyListing = {
  id: string;
  name: string;
  location: string;
  city?: string;
  locality?: string;
  rating: number;
  vibeMatchPercent: number;
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
  vibe_match?: number;
  vibeMatch?: number;
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
  message?: string;
};

export type PropertyDetailResponse = {
  success: boolean;
  data?: Record<string, unknown>;
  googleData?: { google_rating?: number };
  events?: unknown[];
  /** Curated property moments (image/video) from `v2/hello/house`. */
  moments?: unknown[];
  /** Property gallery media (images + property videos) from `v2/hello/house`. */
  media?: unknown[];
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
