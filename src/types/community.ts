export type CommunityEventLocation = {
  lat?: number | string;
  long?: number | string;
  propertyName?: string;
  street?: string;
};

export type CommunityEventDetail = {
  id: number;
  name: string;
  description?: string;
  display_image?: string;
  event_start_date?: string;
  event_end_date?: string;
  start_date?: string;
  amount?: number;
  location?: CommunityEventLocation;
  people_attending?: number;
  attendees_count?: number;
  total_registration?: number;
  current_count?: number;
  female_count?: number;
  property_count?: number;
  hw_properties_count?: number;
  what_to_bring?: string;
  is_registered?: boolean;
};

export type CommunityEventDetailResponse = {
  details: CommunityEventDetail;
  paymentData?: {
    total: number;
  };
};
