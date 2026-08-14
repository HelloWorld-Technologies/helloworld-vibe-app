export type LocalityRatings = {
  dining?: number;
  health?: number;
  safety?: number;
  nightlife?: number;
  transport?: number;
};

export type LocalityNearbyPlace = {
  id?: string | number;
  name?: string;
  distance?: string;
  distance_meters?: number | null;
  image?: string;
  image_url?: string;
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
  photo?: string | null;
  cover_image?: string | null;
  landmark_image?: string | null;
  city_image?: string | null;
  images?: string[];
  locality_type?: string;
  ratings?: LocalityRatings;
  starting_rent?: number | null;
  no_of_properties?: number | null;
  nearby?: Record<string, LocalityNearbyPlace[]>;
  is_popular?: boolean;
};

/** Locality payload returned on `v3/property/list` as `localityInfo`. */
export type LocalityInfo = ApiLocality;

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
