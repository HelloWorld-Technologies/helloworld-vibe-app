import type { PropertyListPayload } from '@/types/property';
import type { SortOption } from '@/components/srp/srp-filter-sort-bar';
import { DEFAULT_SRP_FILTERS, type SrpFilters } from '@/types/srp-filters';

export function hasActiveSrpFilters(filters: SrpFilters = DEFAULT_SRP_FILTERS) {
  return (
    filters.priceMin > DEFAULT_SRP_FILTERS.priceMin ||
    filters.priceMax < DEFAULT_SRP_FILTERS.priceMax ||
    Boolean(filters.gender) ||
    filters.food ||
    filters.amenities.length > 0
  );
}

export function countActiveSrpFilters(filters: SrpFilters = DEFAULT_SRP_FILTERS) {
  let count = 0;
  if (filters.priceMin > DEFAULT_SRP_FILTERS.priceMin || filters.priceMax < DEFAULT_SRP_FILTERS.priceMax) {
    count += 1;
  }
  if (filters.gender) count += 1;
  if (filters.food) count += 1;
  if (filters.amenities.length > 0) count += 1;
  return count;
}

export function buildSrpApiFilter(
  filters: SrpFilters,
  vibeIds: readonly number[] = [],
): PropertyListPayload['filter'] | undefined {
  const hasPrice =
    filters.priceMin > DEFAULT_SRP_FILTERS.priceMin ||
    filters.priceMax < DEFAULT_SRP_FILTERS.priceMax;
  const hasGender = Boolean(filters.gender);
  const hasFood = filters.food;
  const amenities = filters.amenities;
  const vibes = vibeIds.filter((id) => Number.isFinite(id) && id > 0);

  if (!hasPrice && !hasGender && !hasFood && amenities.length === 0 && vibes.length === 0) {
    return undefined;
  }

  return {
    price: hasPrice
      ? {
          minPrice: filters.priceMin,
          maxPrice: filters.priceMax,
        }
      : undefined,
    gender: hasGender ? filters.gender : undefined,
    food: hasFood ? true : undefined,
    amenities,
    ...(vibes.length > 0 ? { vibes } : {}),
  };
}

export function buildSrpApiSorting(
  sort: SortOption,
): PropertyListPayload['sorting'] | undefined {
  if (!sort || sort === 'popularity') return undefined;
  const [keyType, sortType] = sort.split('-');
  if (!keyType || !sortType) return undefined;
  return { keyType, sortType };
}

export function serializeSrpFilters(filters: SrpFilters, sort: SortOption) {
  return JSON.stringify({ ...filters, sort });
}
