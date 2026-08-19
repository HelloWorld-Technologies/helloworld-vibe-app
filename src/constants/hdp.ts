export const HDP_SECTION_NAV = [
  { id: 'about', label: 'About' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'nearby', label: 'Nearby Places' },
  { id: 'reviews', label: 'Review' },
] as const;

export type HdpSectionId = (typeof HDP_SECTION_NAV)[number]['id'];

export type HdpReview = {
  id: string;
  name: string;
  rating: number;
  text: string;
  avatarUri?: string;
};

export const HDP_DUMMY_CATEGORY_RATINGS = [
  { label: 'Cleanliness', score: 4.8 },
  { label: 'Location', score: 4.7 },
  { label: 'Amenities', score: 4.6 },
  { label: 'Community', score: 4.6 },
] as const;

export const HDP_DUMMY_REVIEWS: HdpReview[] = [
  {
    id: 'jim',
    name: 'Jim Halpert',
    rating: 5,
    avatarUri: 'https://i.pravatar.cc/120?img=12',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'pam',
    name: 'Pam Beesly',
    rating: 5,
    avatarUri: 'https://i.pravatar.cc/120?img=5',
    text: 'Great community, smooth move-in, and the room was exactly as shown. Would happily recommend this place to friends.',
  },
  {
    id: 'dwight',
    name: 'Dwight Schrute',
    rating: 4,
    avatarUri: 'https://i.pravatar.cc/120?img=33',
    text: 'Solid amenities and responsive support. The location made my commute much easier during the week.',
  },
  {
    id: 'angela',
    name: 'Angela Martin',
    rating: 5,
    avatarUri: 'https://i.pravatar.cc/120?img=47',
    text: 'Clean spaces, well-managed property, and a friendly resident community. Very happy with my stay here.',
  },
  {
    id: 'oscar',
    name: 'Oscar Martinez',
    rating: 4,
    avatarUri: 'https://i.pravatar.cc/120?img=68',
    text: 'Good value for money with reliable housekeeping and fast issue resolution from the property team.',
  },
  {
    id: 'kevin',
    name: 'Kevin Malone',
    rating: 5,
    avatarUri: 'https://i.pravatar.cc/120?img=15',
    text: 'Comfortable room, easy payments, and helpful staff during onboarding. Overall a smooth experience.',
  },
];

export const HDP_SAMPLE_AMENITIES = [
  'Housekeeping',
  'Internet',
  'Water',
  'Washing machine',
  'RO Drinking Water',
  'Lift',
  'Sofa',
  'Soft furnishing',
  '65" LED TV',
  'Table tennis',
  'Microwave',
] as const;
