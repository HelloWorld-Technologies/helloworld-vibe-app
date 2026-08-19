export const queryKeys = {
  common: ['common'] as const,
  home: (city: string) => ['home', city] as const,
  popularLocalities: (city: string, count?: number) =>
    count != null
      ? (['localities', 'popular', city, count] as const)
      : (['localities', 'popular', city] as const),
  localitySearch: (city: string, keyword: string) =>
    ['locality-search', city, keyword] as const,
  srpProperties: (city: string, locality: string, vibesKey = '') =>
    ['srp-properties', city, locality, vibesKey] as const,
  propertyList: (city: string, locality: string, filtersKey: string, vibesKey = '') =>
    ['property-list', city, locality, filtersKey, vibesKey] as const,
  propertyDetail: (id: string, vibesKey = '') => ['property-detail', id, vibesKey] as const,
  propertyByName: (name: string) => ['property-by-name', name] as const,
  propertyCategories: (id: string) => ['property-categories', id] as const,
  propertyVisitSlots: (id: string) => ['property-visit-slots', id] as const,
  visits: (type?: string) => (type ? (['visits', type] as const) : (['visits'] as const)),
  vibesList: ['vibes', 'list'] as const,
  userVibes: ['vibes', 'user'] as const,
  momentsFeed: ['moments', 'feed', 'video'] as const,
  communityEvents: (tab: string, city: string, pageSize?: number) =>
    pageSize != null
      ? (['community-events', tab, city, pageSize] as const)
      : (['community-events', tab, city] as const),
  communityEventsInfinite: (tab: string, city: string, pageSize: number) =>
    ['community-events', 'infinite', tab, city, pageSize] as const,
  communityRegisteredEvents: (mobile: string) =>
    ['community-events', 'registered', mobile] as const,
  smartMeterRooms: (bookingId: string) => ['smart-meter', 'rooms', bookingId] as const,
  smartMeterPaymentHistory: (bookingId: string) =>
    ['smart-meter', 'payment-history', bookingId] as const,
  smartMeterConsumption: (bookingId: string, startDate: string, endDate: string) =>
    ['smart-meter', 'consumption', bookingId, startDate, endDate] as const,
  pendingReviews: (bookingId: string) => ['pending-reviews', bookingId] as const,
  moveInPayments: (bookingId: string) => ['move-in-payments', bookingId] as const,
};
