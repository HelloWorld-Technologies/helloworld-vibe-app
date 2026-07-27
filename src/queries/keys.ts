export const queryKeys = {
  common: ['common'] as const,
  home: (city: string) => ['home', city] as const,
  localitySearch: (city: string, keyword: string) =>
    ['locality-search', city, keyword] as const,
  srpProperties: (city: string, locality: string) =>
    ['srp-properties', city, locality] as const,
  propertyList: (city: string, locality: string, filtersKey: string) =>
    ['property-list', city, locality, filtersKey] as const,
  propertyDetail: (id: string) => ['property-detail', id] as const,
  propertyCategories: (id: string) => ['property-categories', id] as const,
  propertyVisitSlots: (id: string) => ['property-visit-slots', id] as const,
  visits: ['visits'] as const,
  vibesList: ['vibes', 'list'] as const,
  userVibes: ['vibes', 'user'] as const,
  momentsFeed: ['moments', 'feed', 'video'] as const,
};
