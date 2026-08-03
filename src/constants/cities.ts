import type { LoginIconName } from '@/constants/assets';

export type CityOption = {
  name: string;
  /** Optional display label (supports line breaks to match design). */
  label?: string;
  icon: LoginIconName;
};

export const CITIES: CityOption[] = [
  { name: 'Ahmedabad', icon: 'ahmedabad' },
  { name: 'Bangalore', icon: 'bangalore' },
  { name: 'Coimbatore', icon: 'coimbatore' },
  { name: 'Chennai', icon: 'chennai' },
  { name: 'Delhi', icon: 'delhi' },
  { name: 'Goa', icon: 'goa' },
  { name: 'Gurugram', icon: 'gurugram' },
  { name: 'Hyderabad', icon: 'hyderabad' },
  { name: 'Indore', icon: 'indore' },
  { name: 'Jaipur', icon: 'jaipur' },
  { name: 'Kolkata', icon: 'kolkata' },
  { name: 'Kota', icon: 'kota' },
  { name: 'Mumbai', icon: 'mumbai' },
  { name: 'Noida', icon: 'noida' },
  { name: 'Pune', icon: 'pune' },
  { name: 'Visakhapatnam', label: 'Visakhapa-\ntnam', icon: 'visakhapatnam' },
];
