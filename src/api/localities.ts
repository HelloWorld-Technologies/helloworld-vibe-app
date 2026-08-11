import { http } from '@/api/http';
import type { ApiLocality, LocalitiesResponse, NeighborhoodCard } from '@/types/locality';
import type { PropertyListing } from '@/types/property';

export async function fetchLocalities(params: {
  city: string;
  isPopular?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<LocalitiesResponse> {
  try {
    const { data } = await http.get<LocalitiesResponse>('hello/localities', {
      params: {
        city: params.city.trim().toLowerCase(),
        ...(params.isPopular ? { is_popular: true } : {}),
        ...(params.page != null ? { page: params.page } : {}),
        ...(params.pageSize != null ? { page_size: params.pageSize } : {}),
      },
    });
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load localities';
    return { success: false, message };
  }
}

/** Popular localities for a city — falls back to all localities when none are marked popular. */
export async function fetchPopularLocalities(city: string): Promise<LocalitiesResponse> {
  const popular = await fetchLocalities({ city, isPopular: true, pageSize: 20 });
  if (popular.success && (popular.data?.length ?? 0) > 0) {
    return popular;
  }

  return fetchLocalities({ city, pageSize: 20 });
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

  const matching = properties.filter((property) => {
    const localityName = property.locality?.toLowerCase() ?? '';
    const location = property.location?.toLowerCase() ?? '';
    return localityName === nameKey || location.includes(nameKey);
  });

  const rents = matching
    .map((property) => property.startingRent)
    .filter((rent) => typeof rent === 'number' && rent > 0);

  return {
    id: String(locality.id ?? locality.slug ?? nameKey),
    name,
    imageUri: locality.cover_image || locality.images?.[0] || null,
    startingRent: rents.length > 0 ? Math.min(...rents) : undefined,
    propertyCount: matching.length > 0 ? matching.length : undefined,
  };
}
