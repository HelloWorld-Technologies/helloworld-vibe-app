export type NearbyPlace = {
  name?: string;
  distance?: string;
  distance_meters?: number | null;
  rating?: number;
  vicinity?: string;
  types?: string[];
  image?: string;
  image_url?: string;
};

export type NearByArea = Record<string, NearbyPlace[]>;

export type HdpDayCardOption = {
  id: string;
  placeName: string;
  walkTime: string;
  imageUri?: string | number;
};

export type HdpDayCard = {
  id: string;
  emoji: string;
  category: string;
  placeName: string;
  walkTime: string;
  linkLabel: string;
  imageUri?: string | number;
  options: HdpDayCardOption[];
};
