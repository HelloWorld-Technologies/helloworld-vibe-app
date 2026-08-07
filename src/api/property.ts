import { http } from '@/api/http';
import type {
  ApiProperty,
  PropertyBadge,
  PropertyCategoriesResponse,
  PropertyDetailResponse,
  PropertyListPageInfo,
  PropertyListPayload,
  PropertyListResponse,
} from '@/types/property';
import { formatPropertyImageUrl, getPropertyImageKeys } from '@/utils/images';

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
    return {
      ...data,
      pageInfo: parsePropertyPageInfo(data) ?? parsePropertyPageInfo(data?.data) ?? data.pageInfo,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load properties';
    return { success: false, message };
  }
}

function parsePropertyPageInfo(payload: unknown): PropertyListPageInfo | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;
  const raw = (record.pageInfo ?? record.pagination ?? record.meta ?? record) as Record<
    string,
    unknown
  >;
  if (!raw || typeof raw !== 'object') return undefined;

  const nextPage =
    raw.nextPage ??
    raw.next_page ??
    (typeof raw.hasMore === 'boolean'
      ? raw.hasMore
      : typeof raw.has_next === 'boolean'
        ? raw.has_next
        : typeof raw.hasNextPage === 'boolean'
          ? raw.hasNextPage
          : undefined);

  const total =
    typeof raw.total === 'number'
      ? raw.total
      : typeof raw.totalCount === 'number'
        ? raw.totalCount
        : undefined;

  const count =
    typeof raw.count === 'number'
      ? raw.count
      : typeof raw.pageSize === 'number'
        ? raw.pageSize
        : typeof raw.page_size === 'number'
          ? raw.page_size
          : undefined;

  const page =
    typeof raw.page === 'number'
      ? raw.page
      : typeof raw.currentPage === 'number'
        ? raw.currentPage
        : undefined;

  const pageSize =
    typeof raw.pageSize === 'number'
      ? raw.pageSize
      : typeof raw.page_size === 'number'
        ? raw.page_size
        : typeof count === 'number'
          ? count
          : undefined;

  if (
    nextPage === undefined &&
    total === undefined &&
    count === undefined &&
    page === undefined &&
    pageSize === undefined
  ) {
    return undefined;
  }

  return {
    nextPage: nextPage as PropertyListPageInfo['nextPage'],
    total,
    count,
    page,
    pageSize,
  };
}

/** Resolve the next page param for infinite property list queries. */
export function resolveNextPropertyPage(
  pageInfo: PropertyListPageInfo | undefined,
  lastPageParam: number,
  lastPageCount: number,
  pageSize: number,
): number | undefined {
  const next = pageInfo?.nextPage;
  if (next === false || next === null) return undefined;
  if (typeof next === 'number' && next > lastPageParam) return next;
  if (next === true) return lastPageParam + 1;

  if (typeof pageInfo?.total === 'number' && pageInfo.total >= 0) {
    const loaded = lastPageParam * pageSize;
    if (loaded < pageInfo.total) return lastPageParam + 1;
    return undefined;
  }

  // Fallback when API omits pageInfo: a full page usually means more may exist.
  if (lastPageCount >= pageSize) return lastPageParam + 1;
  return undefined;
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

  const locality = property.locality || property.address?.locality || undefined;
  const city = property.city || property.address?.city || undefined;
  const location =
    property.address?.line2 ||
    property.address?.locality ||
    property.locality ||
    'Coliving PG';

  return {
    id: String(property.id),
    name: property.display_name ?? property.name ?? 'HelloWorld Property',
    location,
    city,
    locality,
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
