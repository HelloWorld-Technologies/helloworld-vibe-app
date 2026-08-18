import { ImageAssets } from '@/constants/assets';
import type { PropertyListing } from '@/types/property';

export const SAMPLE_PROPERTY: PropertyListing = {
  id: 'hw-mahaveer',
  name: 'HelloWorld Mahaveer',
  location: 'Coliving PG in HSR Layout',
  rating: 4.5,
  vibeMatchPercent: 93,
  startingRent: 12500,
  roomTypes: ['Private', 'Double', 'Triple', 'Quadruple'],
  images: [ImageAssets.loginBento1, ImageAssets.loginBento2, ImageAssets.loginBento3],
  badges: [
    { label: 'Filling Fast', variant: 'filling-fast' },
    { label: 'Women Only', variant: 'gender' },
  ],
};

export const SAMPLE_PROPERTIES: PropertyListing[] = [
  SAMPLE_PROPERTY,
  {
    ...SAMPLE_PROPERTY,
    id: 'hw-koramangala',
    name: 'HelloWorld Koramangala',
    location: 'Coliving PG in Koramangala 5th Block',
    vibeMatchPercent: 88,
    startingRent: 14000,
    badges: [{ label: 'Filling Fast', variant: 'filling-fast' }],
    images: [ImageAssets.loginBento2, ImageAssets.loginBento3, ImageAssets.loginBento4],
  },
  {
    ...SAMPLE_PROPERTY,
    id: 'hw-indiranagar',
    name: 'HelloWorld Indiranagar',
    location: 'Coliving PG in Indiranagar',
    rating: 4.7,
    vibeMatchPercent: 91,
    startingRent: 15000,
    badges: [{ label: 'Women Only', variant: 'gender' }],
    images: [ImageAssets.loginBento3, ImageAssets.loginBento4, ImageAssets.loginBento1],
  },
];
