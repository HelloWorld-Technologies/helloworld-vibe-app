import { http } from '@/api/http';
import type { PropertyBadge } from '@/types/property';
import { formatPropertyImageUrl, getPropertyImageKeys } from '@/utils/images';

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
  };
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

export type PropertyListResponse = {
  success: boolean;
  data?: ApiProperty[];
  pageInfo?: {
    total?: number;
    nextPage?: number | null;
  };
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

export async function getPropertyData(id: number | string): Promise<PropertyDetailResponse> {
  try {
    const { data } = await http.get<PropertyDetailResponse>('v2/hello/house', {
      params: { active: true, id },
    });
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load property';
    return { success: false, message };
  }
}

/** Resolve a house id when CRM visit payloads only include Building_Name. */
export async function lookupPropertyIdByName(name: string): Promise<number | null> {
  const trimmed = name.trim();
  if (!trimmed || trimmed === 'Property') return null;

  try {
    const { data } = await http.get<PropertyDetailResponse>('v2/hello/house', {
      params: { active: true, name: trimmed },
    });
    if (!data.success || !data.data || typeof data.data !== 'object') return null;
    const raw = (data.data as { id?: unknown }).id;
    if (raw == null || raw === '') return null;
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? numeric : null;
  } catch {
    return null;
  }
}

export type PropertyCategoriesResponse = {
  success: boolean;
  data?: Record<string, unknown>[];
  message?: string;
};

export async function getPropertyCategories(
  propertyId: number | string,
): Promise<PropertyCategoriesResponse> {
  try {
    const { data } = await http.get<PropertyCategoriesResponse>('v2/category/list', {
      params: { active: true, property_id: propertyId },
    });
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load room categories';
    return { success: false, message };
  }
}

export async function fetchPropertyList(
  payload: PropertyListPayload,
  params: { page: number; page_size?: number },
): Promise<PropertyListResponse> {
  try {
    const { data } = await http.put<PropertyListResponse>('v3/property/list', payload, {
      params,
    });
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load properties';
    return { success: false, message };
  }
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function buildBadges(property: ApiProperty): PropertyBadge[] {
  const badges: PropertyBadge[] = [];

  if (property.is_filling_fast || property.filling_fast || property.tags?.includes('filling_fast')) {
    badges.push({ label: 'Filling Fast', variant: 'filling-fast' });
  }

  const gender = property.gender?.toLowerCase() ?? '';
  if (gender.includes('female') || gender.includes('women')) {
    badges.push({ label: 'Women Only', variant: 'women-only' });
  }

  return badges;
}

export function mapApiPropertyToListing(property: ApiProperty) {
  const imageKeys = getPropertyImageKeys(property as Record<string, unknown>);

  const roomTypes =
    property.room_types?.map(titleCase) ??
    property.sharing_types?.map(titleCase) ??
    ['Private', 'Double', 'Triple'];

  const location =
    property.address?.line2 ||
    property.address?.locality ||
    property.locality ||
    'Coliving PG';

  return {
    id: String(property.id),
    name: property.display_name ?? property.name ?? 'HelloWorld Property',
    location,
    rating: property.rating ?? property.google_rating ?? 4.5,
    vibeMatchPercent: property.vibe_match ?? property.vibeMatch ?? 90,
    startingRent: property.min_rent ?? property.starting_rent ?? property.price ?? 0,
    roomTypes,
    images: imageKeys.length
      ? imageKeys.map((key) => ({ uri: formatPropertyImageUrl(key) }))
      : [{ uri: formatPropertyImageUrl() }],
    badges: buildBadges(property),
  };
}
