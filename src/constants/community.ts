export type CommunityEventsTab = 'upcoming' | 'past' | 'registered';

export const COMMUNITY_EVENT_TABS: { id: CommunityEventsTab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'registered', label: 'Registered' },
];

export const COMMUNITY_TAB_HEADINGS: Record<CommunityEventsTab, string> = {
  upcoming: 'Weekend plans? We got you!',
  past: 'Moments from the community',
  registered: 'See you there 👀',
};

export const EVENT_REQUEST_CATEGORIES = [
  'Sports',
  'Food & Drinks',
  'Festive',
  'Arts & culture',
  'Outdoor',
  'Others',
] as const;

import { COMING_SOON_IMAGE_URI } from '@/utils/images';

export const EVENT_FALLBACK_IMAGE = COMING_SOON_IMAGE_URI;
