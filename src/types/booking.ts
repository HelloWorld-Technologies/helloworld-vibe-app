export type OccupancyType = 'private' | 'double' | 'triple' | 'quadruple';

export type BookRoomOption = {
  id: string;
  name: string;
  price: number;
  features: string[];
};

export type OccupantDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  moveInDate: Date;
};

export type PropertyCategory = {
  id: number | string;
  name: string;
  display_name?: string;
  inventory_type?: string;
  rent?: number;
  private_rent?: number;
  offer_rent?: number;
  private_offer_rent?: number;
  amenities?: string[];
  features?: string[];
  key_feature?: string[];
  facing?: string;
  balcony?: boolean;
  attached_bathroom?: boolean;
  beds_per_room?: number;
  maximum_occupancy?: number;
  show_to_ui?: boolean;
  is_removed?: boolean;
  sold_out?: boolean;
};
