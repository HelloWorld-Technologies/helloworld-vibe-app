import { http } from "@/api/http";
import type {
  ApiLocality,
  LocalitiesResponse,
  NeighborhoodCard,
} from "@/types/locality";
import type { PropertyListing } from "@/types/property";
import { formatLocalityImageUrl } from "@/utils/images";

export async function fetchLocalities(params: {
  city: string;
  isPopular?: boolean;
  page?: number;
  pageSize?: number;
  count?: number;
}): Promise<LocalitiesResponse> {
  try {
    const { data } = await http.get<LocalitiesResponse>("hello/localities", {
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
    const message =
      error instanceof Error ? error.message : "Failed to load localities";
    return { success: false, message };
  }
}

/** Popular localities for a city — falls back to all localities when none are marked popular. */
export async function fetchPopularLocalities(
  city: string,
  count?: number,
): Promise<LocalitiesResponse> {
  const limit =
    count != null
      ? { count, page: 1, pageSize: count }
      : { pageSize: 10 };

  const popular = await fetchLocalities({ city, isPopular: true, ...limit });
  const popularData = (popular.data ?? []).slice(0, count ?? popular.data?.length);
  if (popular.success && popularData.length > 0) {
    return { ...popular, data: popularData };
  }

  const all = await fetchLocalities({ city, ...limit });
  return {
    ...all,
    data: (all.data ?? []).slice(0, count ?? all.data?.length),
  };
}

function listingImageUri(property: PropertyListing): string | null {
  const first = property.images[0];
  if (
    typeof first === "object" &&
    first != null &&
    "uri" in first &&
    typeof first.uri === "string"
  ) {
    return formatLocalityImageUrl(first.uri);
  }
  return null;
}

export function mapLocalityToNeighborhoodCard(
  locality: ApiLocality,
  properties: readonly PropertyListing[] = [],
): NeighborhoodCard {
  const name =
    locality.display_name?.trim() ||
    locality.locality_name?.trim() ||
    "Locality";
  const nameKey = name.toLowerCase();

  const matching = properties.filter((property) => {
    const localityName = property.locality?.toLowerCase() ?? "";
    const location = property.location?.toLowerCase() ?? "";
    return localityName === nameKey || location.includes(nameKey);
  });

  // Prefer locality cover photo from hello/localities, then a property photo.
  // Missing images stay null so LocalityCardImage shows bundled coming-soon
  // (never category / hero artwork).
  const imageUri =
    formatLocalityImageUrl(locality.photo) ||
    formatLocalityImageUrl(locality.cover_image) ||
    formatLocalityImageUrl(locality.landmark_image) ||
    formatLocalityImageUrl(locality.images?.[0]) ||
    matching.map(listingImageUri).find(Boolean) ||
    null;

  const rents = matching
    .map((property) => property.startingRent)
    .filter((rent) => typeof rent === "number" && rent > 0);

  const startingRent =
    typeof locality.starting_rent === "number" && locality.starting_rent > 0
      ? locality.starting_rent
      : rents.length > 0
        ? Math.min(...rents)
        : undefined;

  const propertyCount =
    typeof locality.no_of_properties === "number" &&
    locality.no_of_properties > 0
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
  if (propertyCount <= 0) return "View properties";

  const countLabel = `${propertyCount} ${propertyCount === 1 ? "Property" : "Properties"}`;
  if (item.startingRent == null || item.startingRent <= 0) return countLabel;

  return `Starting ₹${item.startingRent.toLocaleString("en-IN")} | ${countLabel}`;
}
