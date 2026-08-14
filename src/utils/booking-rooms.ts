import type { BookRoomOption, OccupancyType, PropertyCategory } from '@/types/booking';

const OCCUPANCY_LABELS: Record<OccupancyType, string> = {
  private: 'Private',
  double: 'Double',
  triple: 'Triple',
  quadruple: 'Quadruple',
};

const OCCUPANCY_ORDER: OccupancyType[] = ['private', 'double', 'triple', 'quadruple'];

const DEFAULT_FEATURES = ['Balcony', 'Attached Bathroom', 'North Facing'];

export function getOccupancyLabel(type: OccupancyType) {
  return OCCUPANCY_LABELS[type];
}

export function buildOccupancyOptions(roomTypes?: string[]): OccupancyType[] {
  const normalized = roomTypes?.map((type) => type.toLowerCase()) ?? [];

  const options: OccupancyType[] = [];
  if (normalized.some((type) => type.includes('private'))) options.push('private');
  if (normalized.some((type) => type.includes('double'))) options.push('double');
  if (normalized.some((type) => type.includes('triple'))) options.push('triple');
  if (normalized.some((type) => type.includes('quad'))) options.push('quadruple');

  return options.length > 0 ? options : [...OCCUPANCY_ORDER];
}

function visibleCategory(category: PropertyCategory) {
  if (category.is_removed) return false;
  if (category.show_to_ui === false) return false;
  return true;
}

/** True only for multi-bed sharing (2SHARING+), not PRIVATE / Classic+ / 1SHARING. */
export function isSharingInventoryType(inventoryType?: string) {
  const normalized = String(inventoryType || '')
    .toUpperCase()
    .replace(/\s+/g, '');
  if (!normalized.includes('SHARING')) return false;
  const match = normalized.match(/^(\d+)SHARING$/);
  if (match) return Number.parseInt(match[1], 10) >= 2;
  return normalized === 'SHARING';
}

function sharingCountFromInventoryType(inventoryType: string) {
  const normalized = inventoryType.toUpperCase().replace(/\s+/g, '');
  const match = normalized.match(/^(\d+)SHARING$/);
  if (match) return Number.parseInt(match[1], 10);
  return null;
}

export function categorySupportsPrivate(category: PropertyCategory) {
  if (!isSharingInventoryType(category.inventory_type)) return true;
  return (category.private_rent ?? 0) > 0;
}

export function categorySharingOccupancy(category: PropertyCategory): OccupancyType | null {
  if (!isSharingInventoryType(category.inventory_type)) return null;

  const sharingCount = sharingCountFromInventoryType(category.inventory_type ?? '');
  if (sharingCount === 2) return 'double';
  if (sharingCount === 3) return 'triple';
  if (sharingCount === 4) return 'quadruple';

  const beds = category.beds_per_room || category.maximum_occupancy;
  if (beds === 2) return 'double';
  if (beds === 3) return 'triple';
  if (beds != null && beds >= 4) return 'quadruple';

  return null;
}

export function categoryMatchesOccupancy(
  category: PropertyCategory,
  occupancy: OccupancyType,
) {
  if (!visibleCategory(category)) return false;

  if (occupancy === 'private') {
    return categorySupportsPrivate(category);
  }

  return categorySharingOccupancy(category) === occupancy;
}

export function getAvailableOccupancies(categories: readonly PropertyCategory[] = []) {
  const visible = categories.filter(visibleCategory);
  return OCCUPANCY_ORDER.filter((occupancy) =>
    visible.some((category) => categoryMatchesOccupancy(category, occupancy)),
  );
}

export function filterCategoriesByOccupancy(
  categories: readonly PropertyCategory[],
  occupancy: OccupancyType,
) {
  return categories.filter((category) => categoryMatchesOccupancy(category, occupancy));
}

export function getRentForOccupancy(category: PropertyCategory, occupancy: OccupancyType) {
  if (occupancy === 'private') {
    if (isSharingInventoryType(category.inventory_type)) {
      return category.private_rent ?? category.private_offer_rent ?? 0;
    }
    return category.rent ?? category.offer_rent ?? 0;
  }
  return category.rent ?? category.offer_rent ?? 0;
}

function buildFeatures(category: PropertyCategory): string[] {
  const fromApi = [
    ...(Array.isArray(category.key_feature) ? category.key_feature : []),
    ...(Array.isArray(category.amenities) ? category.amenities : []),
    ...(Array.isArray(category.features) ? category.features : []),
  ].filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

  if (fromApi.length > 0) {
    return fromApi.slice(0, 3);
  }

  const features: string[] = [];
  if (category.balcony) features.push('Balcony');
  if (category.attached_bathroom) features.push('Attached Bathroom');
  if (category.facing) features.push(`${category.facing} Facing`);

  return features.length > 0 ? features : DEFAULT_FEATURES;
}

export function buildBookRoomOptions(
  categories: PropertyCategory[] | undefined,
  occupancy: OccupancyType,
  fallbackRent?: number,
): BookRoomOption[] {
  if (categories && categories.length > 0) {
    return filterCategoriesByOccupancy(categories, occupancy).map((category, index) => ({
      id: String(category.id ?? index),
      name: category.display_name || category.name || `Room Type ${index + 1}`,
      price: getRentForOccupancy(category, occupancy) || fallbackRent || 0,
      features: buildFeatures(category),
    }));
  }

  const base = fallbackRent && fallbackRent > 0 ? fallbackRent : 12500;

  return [
    {
      id: '1',
      name: 'Room Type 1',
      price: base,
      features: DEFAULT_FEATURES,
    },
    {
      id: '2',
      name: 'Room Type 2',
      price: base + 1500,
      features: ['Attached Bathroom', 'East Facing'],
    },
    {
      id: '3',
      name: 'Room Type 3',
      price: base + 3000,
      features: ['Balcony', 'West Facing'],
    },
  ];
}

export function formatBookingPrice(amount: number) {
  if (!amount || amount <= 0) return '₹—';
  return `₹${amount.toLocaleString('en-IN')}/mo`;
}
