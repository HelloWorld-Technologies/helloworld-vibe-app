export type LocalityRatings = {
  dining?: number;
  health?: number;
  safety?: number;
  nightlife?: number;
  transport?: number;
};

export type ApiLocality = {
  id: string | number;
  city?: string;
  locality_name?: string;
  display_name?: string;
  slug?: string;
  lat?: number;
  long?: number;
  description?: string;
  cover_image?: string | null;
  landmark_image?: string | null;
  city_image?: string | null;
  images?: string[];
  locality_type?: string;
  ratings?: LocalityRatings;
  is_popular?: boolean;
};

export type LocalitiesResponse = {
  success: boolean;
  data?: ApiLocality[];
  total_count?: number;
  page?: number;
  page_size?: number;
  message?: string;
};

export type NeighborhoodCard = {
  id: string;
  name: string;
  imageUri?: string | null;
  startingRent?: number;
  propertyCount?: number;
};
