import { http } from '@/api/http';
import type { ApiLocality, LocalitiesResponse, NeighborhoodCard } from '@/types/locality';
import type { PropertyListing } from '@/types/property';

export async function fetchLocalities(params: {
  city: string;
  isPopular?: boolean;
  page?: number;
  pageSize?: number;
  count?: number;
}): Promise<LocalitiesResponse> {
  try {
    const { data } = await http.get<LocalitiesResponse>('hello/localities', {
      params: {
        city: params.city.trim().toLowerCase(),
        ...(params.isPopular ? { is_popular: true } : {}),
        ...(params.page != null ? { page: params.page } : {}),
        ...(params.pageSize != null ? { page_size: params.pageSize } : {}),
        ...(params.count != null ? { count: params.count } : {}),
      },
    });
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load localities';
    return { success: false, message };
  }
}

/** Popular localities for a city — falls back to all localities when none are marked popular. */
export async function fetchPopularLocalities(
  city: string,
  count?: number,
): Promise<LocalitiesResponse> {
  const limit = { ...(count != null ? { count } : { pageSize: 20 }) };
  const popular = await fetchLocalities({ city, isPopular: true, ...limit });
  if (popular.success && (popular.data?.length ?? 0) > 0) {
    return popular;
  }

  return fetchLocalities({ city, ...limit });
}

export function mapLocalityToNeighborhoodCard(
  locality: ApiLocality,
  properties: readonly PropertyListing[] = [],
): NeighborhoodCard {
  const name =
    locality.display_name?.trim() ||
    locality.locality_name?.trim() ||
    'Locality';
  const nameKey = name.toLowerCase();
  const photo =
    locality.photo?.trim() ||
    locality.cover_image?.trim() ||
    locality.images?.[0]?.trim() ||
    '';
  const imageUri =
    !photo || photo === 'null' || photo === 'undefined' || photo.includes('coming-soon')
      ? null
      : photo;

  const matching = properties.filter((property) => {
    const localityName = property.locality?.toLowerCase() ?? '';
    const location = property.location?.toLowerCase() ?? '';
    return localityName === nameKey || location.includes(nameKey);
  });

  const rents = matching
    .map((property) => property.startingRent)
    .filter((rent) => typeof rent === 'number' && rent > 0);

  const startingRent =
    typeof locality.starting_rent === 'number' && locality.starting_rent > 0
      ? locality.starting_rent
      : rents.length > 0
        ? Math.min(...rents)
        : undefined;

  const propertyCount =
    typeof locality.no_of_properties === 'number' && locality.no_of_properties > 0
      ? locality.no_of_properties
      : matching.length > 0
        ? matching.length
        : undefined;

  return {
    id: String(locality.id ?? locality.slug ?? nameKey),
    name,
    imageUri,
    startingRent,
    propertyCount,
  };
}

export function formatNeighborhoodMeta(item: NeighborhoodCard) {
  const propertyCount = item.propertyCount ?? 0;
  if (propertyCount <= 0) return 'View properties';

  const countLabel = `${propertyCount} ${propertyCount === 1 ? 'Property' : 'Properties'}`;
  if (item.startingRent == null || item.startingRent <= 0) return countLabel;

  return `Starting ₹${item.startingRent.toLocaleString('en-IN')} | ${countLabel}`;
}
